import { pool } from "../../config/db";

type UserRole = "admin" | "customer";

const BOOKING_PUBLIC_FIELDS = "id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status";

function diffDaysInclusive(start: Date, end: Date): number {
    const startUTC = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    const endUTC = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
    const diff = endUTC - startUTC;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

const autoReturnExpired = async () => {
  await pool.query(`
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

const createBooking = async(customer_id: number, vehicle_id: number, rent_start_date: Date , rent_end_date: Date) => {
    const client = await pool.connect();

    try{
        await client.query("BEGIN");

        const vehicleRes = await client.query(
            `SELECT id, vehicle_name, daily_rent_price, availability_status FROM vehicles WHERE id=$1 FOR UPDATE`, [vehicle_id]
        );

        if (vehicleRes.rowCount === 0){
            throw new Error ("Vehicle not found");
        }

        const vehicle = vehicleRes.rows[0];

        if (vehicle.availability_status != "available"){
            throw new Error("Vehicle is not available");
        }

        const start = new Date (rent_start_date);
        const end = new Date(rent_end_date);

        const days = diffDaysInclusive(start,end);
        if (days <= 0) {
            throw new Error("Invalid rental period");
        }

        const dailyPrice = Number(vehicle.daily_rent_price);
        const totalPrice = dailyPrice*days;

        const bookingRes = await client.query(
            `INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status) VALUES ($1, $2, $3, $4, $5, 'active') RETURNING ${BOOKING_PUBLIC_FIELDS}`, [customer_id, vehicle_id, start, end, totalPrice]
        );

        await client.query(
            `UPDATE vehicles SET availability_status = 'booked' WHERE id = $1`, [vehicle_id]
        );

        await client.query('COMMIT');

        const booking = bookingRes.rows[0];

        return {
            ...booking,
            vehicle: {
                vehicle_name: vehicle.vehicle_name,
                daily_rent_price: dailyPrice,
            },
        };

    }catch (err){
        await client.query("ROLLBACK");
        throw err;
    } finally{
        client.release();
    }
};


const getBooking = async() => {
    await autoReturnExpired();
    const result = await pool.query(`SELECT ${BOOKING_PUBLIC_FIELDS} FROM bookings ORDER BY id DESC`);
    return result.rows;
};

const getBookingsForAdmin = async () => {
  await autoReturnExpired();
  const result = await pool.query(
    `SELECT ${BOOKING_PUBLIC_FIELDS} FROM bookings ORDER BY id DESC`
  );
  return result.rows;
};

const getBookingsForCustomer = async (customerId: number) => {
  await autoReturnExpired();
  const result = await pool.query(
    `SELECT ${BOOKING_PUBLIC_FIELDS}
     FROM bookings
     WHERE customer_id = $1
     ORDER BY id DESC`,
    [customerId]
  );
  return result.rows;
};

const getSingleBooking = async(bookingId: number) =>{
    await autoReturnExpired();
    const result = await pool.query(`SELECT ${BOOKING_PUBLIC_FIELDS} FROM bookings WHERE id=$1`, [bookingId]);

    return result.rows[0] ?? null;
};

const getSingleBookingScoped = async (
  bookingId: number,
  role: UserRole,
  userId: number
) => {
  await autoReturnExpired();

  const query =
    role === "admin"
      ? `SELECT ${BOOKING_PUBLIC_FIELDS} FROM bookings WHERE id=$1`
      : `SELECT ${BOOKING_PUBLIC_FIELDS} FROM bookings WHERE id=$1 AND customer_id=$2`;

  const params = role === "admin" ? [bookingId] : [bookingId, userId];

  const result = await pool.query(query, params);
  return result.rows[0] ?? null;
};

const updateBooking = async(bookingId: number, status: string) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const bookingRes = await client.query(
            `SELECT id, vehicle_id, rent_start_date, status FROM bookings WHERE id = $1 FOR UPDATE`, [bookingId]
        );

        if (bookingRes.rowCount === 0) return null;

        const booking = bookingRes.rows[0];

        if (status !== "cancelled" && status !="returned"){
            throw new Error("Invalid status update");
        }

        if (status === "cancelled"){
            const today = new Date();
            const start = new Date(booking.rent_start_date);

            const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
            const startUTC = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
            if (todayUTC >= startUTC){
                throw new Error("Cannot cancel booking after start date");
            }
        }

        const updatedRes = await client.query(
            `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING ${BOOKING_PUBLIC_FIELDS}`, [status, bookingId]
        );

        if (status === "cancelled" || status === "returned"){
            await client.query(`UPDATE vehicles SET availability_status = 'available' WHERE id = $1`, [booking.vehicle_id]);
        }

        await client.query("COMMIT");

        if (status === "returned"){
            return {
                ...updatedRes.rows[0],
                vehicle: { availability_status: "available" },
            };
        }

        return updatedRes.rows[0];
    
    } catch(err){
        await client.query("ROLLBACK");
        throw err;
    } finally{
        client.release();
    }
};

const updateBookingScoped = async (
  bookingId: number,
  status: string,
  role: UserRole,
  userId: number
) => {
  const client = await pool.connect();

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

    const bookingRes = await client.query(
      `SELECT id, customer_id, vehicle_id, rent_start_date, status
       FROM bookings
       WHERE id = $1
       FOR UPDATE`,
      [bookingId]
    );

    if ((bookingRes.rowCount ?? 0) === 0) return null;

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
    const updatedRes = await client.query(
      `UPDATE bookings
       SET status = $1
       WHERE id = $2
       RETURNING ${BOOKING_PUBLIC_FIELDS}`,
      [status, bookingId]
    );

    await client.query(
      `UPDATE vehicles SET availability_status = 'available' WHERE id = $1`,
      [booking.vehicle_id]
    );

    await client.query("COMMIT");

    if (status === "returned") {
      return {
        ...updatedRes.rows[0],
        vehicle: { availability_status: "available" },
      };
    }

    return updatedRes.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const deleteBooking = async(bookingId: number) => {
    const result = await pool.query(`DELETE FROM bookings WHERE id=$1`, [bookingId]);

    return result.rowCount ?? 0;
};


export const bookingServices = {
    createBooking,
    getBooking,
    getSingleBooking,
    updateBooking,
    deleteBooking,

  getBookingsForAdmin,
  getBookingsForCustomer,
  getSingleBookingScoped,
  updateBookingScoped,
}