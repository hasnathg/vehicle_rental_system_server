"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingServices = void 0;
const db_1 = require("../../config/db");
const BOOKING_PUBLIC_FIELDS = "id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status";
function diffDaysInclusive(start, end) {
    const startUTC = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    const endUTC = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
    const diff = endUTC - startUTC;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
const autoReturnExpired = async () => {
    await db_1.pool.query(`
    WITH expired AS (
      UPDATE bookings
      SET status = 'returned'
      WHERE status = 'active'
        AND rent_end_date < CURRENT_DATE
      RETURNING vehicle_id
    )
    UPDATE vehicles v
    SET availability_status = 'available'
    FROM (SELECT DISTINCT vehicle_id FROM expired) e
    WHERE v.id = e.vehicle_id;
  `);
};
const createBooking = async (customer_id, vehicle_id, rent_start_date, rent_end_date) => {
    const client = await db_1.pool.connect();
    try {
        await client.query("BEGIN");
        const vehicleRes = await client.query(`SELECT id, vehicle_name, daily_rent_price, availability_status FROM vehicles WHERE id=$1 FOR UPDATE`, [vehicle_id]);
        if (vehicleRes.rowCount === 0) {
            throw new Error("Vehicle not found");
        }
        const vehicle = vehicleRes.rows[0];
        if (vehicle.availability_status != "available") {
            throw new Error("Vehicle is not available");
        }
        const start = new Date(rent_start_date);
        const end = new Date(rent_end_date);
        const days = diffDaysInclusive(start, end);
        if (days <= 0) {
            throw new Error("Invalid rental period");
        }
        const dailyPrice = Number(vehicle.daily_rent_price);
        const totalPrice = dailyPrice * days;
        const bookingRes = await client.query(`INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status) VALUES ($1, $2, $3, $4, $5, 'active') RETURNING ${BOOKING_PUBLIC_FIELDS}`, [customer_id, vehicle_id, start, end, totalPrice]);
        await client.query(`UPDATE vehicles SET availability_status = 'booked' WHERE id = $1`, [vehicle_id]);
        await client.query('COMMIT');
        const booking = bookingRes.rows[0];
        return {
            ...booking,
            vehicle: {
                vehicle_name: vehicle.vehicle_name,
                daily_rent_price: dailyPrice,
            },
        };
    }
    catch (err) {
        await client.query("ROLLBACK");
        throw err;
    }
    finally {
        client.release();
    }
};
const getBookingsForAdmin = async () => {
    await autoReturnExpired();
    const result = await db_1.pool.query(`SELECT b.id,
      b.customer_id,
      b.vehicle_id,
      b.rent_start_date,
      b.rent_end_date,
      b.total_price,
      b.status,
      json_build_object(
        'name', u.name,
        'email', u.email
      ) AS customer,
      json_build_object(
        'vehicle_name', v.vehicle_name,
        'registration_number', v.registration_number
      ) AS vehicle
    FROM bookings b
    JOIN users u ON u.id = b.customer_id
    JOIN vehicles v ON v.id = b.vehicle_id
    ORDER BY b.id DESC`);
    return result.rows;
};
const getBookingsForCustomer = async (customerId) => {
    await autoReturnExpired();
    const result = await db_1.pool.query(`SELECT b.id,
      b.vehicle_id,
      b.rent_start_date,
      b.rent_end_date,
      b.total_price,
      b.status,
      json_build_object(
        'vehicle_name', v.vehicle_name,
        'registration_number', v.registration_number,
        'type', v.type
      ) AS vehicle
    FROM bookings b
    JOIN vehicles v ON v.id = b.vehicle_id
    WHERE b.customer_id = $1
     ORDER BY b.id DESC`, [customerId]);
    return result.rows;
};
const getSingleBookingScoped = async (bookingId, role, userId) => {
    await autoReturnExpired();
    const query = role === "admin"
        ? `SELECT  WHERE b.id,
          b.customer_id,
          b.vehicle_id,
          b.rent_start_date,
          b.rent_end_date,
          b.total_price,
          b.status,
          json_build_object('name', u.name, 'email', u.email) AS customer,
          json_build_object('vehicle_name', v.vehicle_name, 'registration_number', v.registration_number) AS vehicle
        FROM bookings b
        JOIN users u ON u.id = b.customer_id
        JOIN vehicles v ON v.id = b.vehicle_id b.id=$1`
        : `SELECT  b.id,
          b.vehicle_id,
          b.rent_start_date,
          b.rent_end_date,
          b.total_price,
          b.status,
          json_build_object(
            'vehicle_name', v.vehicle_name,
            'registration_number', v.registration_number,
            'type', v.type
          ) AS vehicle
        FROM bookings b
        JOIN vehicles v ON v.id = b.vehicle_id WHERE b.id=$1 AND b.customer_id=$2`;
    const params = role === "admin" ? [bookingId] : [bookingId, userId];
    const result = await db_1.pool.query(query, params);
    return result.rows[0] ?? null;
};
const updateBookingScoped = async (bookingId, status, role, userId) => {
    const client = await db_1.pool.connect();
    try {
        await client.query("BEGIN");
        await client.query(`
      WITH expired AS (
        UPDATE bookings
        SET status = 'returned'
        WHERE status = 'active'
          AND rent_end_date < CURRENT_DATE
        RETURNING vehicle_id
      )
      UPDATE vehicles v
      SET availability_status = 'available'
      FROM (SELECT DISTINCT vehicle_id FROM expired) e
      WHERE v.id = e.vehicle_id;
    `);
        const bookingRes = await client.query(`SELECT id, customer_id, vehicle_id, rent_start_date, status
       FROM bookings
       WHERE id = $1
       FOR UPDATE`, [bookingId]);
        if ((bookingRes.rowCount ?? 0) === 0)
            return null;
        const booking = bookingRes.rows[0];
        if (role === "customer" && booking.customer_id !== userId) {
            throw new Error("Forbidden: cannot modify another user's booking");
        }
        if (status !== "cancelled" && status !== "returned") {
            throw new Error("Invalid status update");
        }
        if (status === "cancelled") {
            const today = new Date();
            const start = new Date(booking.rent_start_date);
            const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
            const startUTC = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
            if (todayUTC >= startUTC) {
                throw new Error("Cannot cancel booking after start date");
            }
        }
        const updatedRes = await client.query(`UPDATE bookings
       SET status = $1
       WHERE id = $2
       RETURNING ${BOOKING_PUBLIC_FIELDS}`, [status, bookingId]);
        await client.query(`UPDATE vehicles SET availability_status = 'available' WHERE id = $1`, [booking.vehicle_id]);
        await client.query("COMMIT");
        if (status === "returned") {
            return {
                ...updatedRes.rows[0],
                vehicle: { availability_status: "available" },
            };
        }
        return updatedRes.rows[0];
    }
    catch (err) {
        await client.query("ROLLBACK");
        throw err;
    }
    finally {
        client.release();
    }
};
const deleteBooking = async (bookingId) => {
    const result = await db_1.pool.query(`DELETE FROM bookings WHERE id=$1`, [bookingId]);
    return result.rowCount ?? 0;
};
exports.bookingServices = {
    createBooking,
    getBookingsForAdmin,
    getBookingsForCustomer,
    getSingleBookingScoped,
    updateBookingScoped,
    deleteBooking,
};
