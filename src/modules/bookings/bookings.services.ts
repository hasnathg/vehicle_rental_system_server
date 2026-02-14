import { pool } from "../../config/db";

const BOOKING_PUBLIC_FIELDS = "id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status";

function diffDaysInclusive(start: Date, end: Date): number {
    const startUTC = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    const endUTC = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
    const diff = endUTC - startUTC;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

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
        await client.query("ROOLBACK");
        throw err;
    } finally{
        client.release();
    }
};

const getBooking = async() => {
    const result = await pool.query(`SELECT ${BOOKING_PUBLIC_FIELDS} FROM bookings ORDER BY id desc`);
    return result.rows;
};

const getSingleBooking = async(bookingId: number) =>{
    const result = await pool.query(`SELECT ${BOOKING_PUBLIC_FIELDS} FROM vehicles WHERE id=$1`, [bookingId]);

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

const deleteBooking = async(bookingId: number) => {
    const result = await pool.query(`DELETE FROM bookings WHERE id=$1`, [bookingId]);

    return result.rowCount;
};


export const bookingServices = {
    createBooking,
    getBooking,
    getSingleBooking,
    updateBooking,
    deleteBooking,
}