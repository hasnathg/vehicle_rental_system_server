import { pool } from "../../config/db"

const VEHICLE_PUBLIC_FIELDS =
  "id, vehicle_name, type, registration_number, daily_rent_price, availability_status";

const createVehicle = async(vehicle_name: string, type: string, registration_number: string, daily_rent_price: number, availability_status: string) => {
    const result = await pool.query(`INSERT INTO vehicles(vehicle_name, type, registration_number, daily_rent_price, availability_status) VALUES($1,$2,$3,$4,$5) RETURNING ${VEHICLE_PUBLIC_FIELDS}`, [vehicle_name, type, registration_number, daily_rent_price, availability_status]
    );

    return result.rows[0];
};

const getVehicle = async()=>{
    const result = await pool.query(`SELECT ${VEHICLE_PUBLIC_FIELDS} FROM vehicles ORDER BY id DESC`);

    return result.rows;
};

const getSingleVehicle = async(vehicleId: number) =>{
    const result = await pool.query(`SELECT ${VEHICLE_PUBLIC_FIELDS} FROM vehicles WHERE id = $1`, [vehicleId]

    );
    return result.rows[0] ?? null;
};

const updateVehicle = async(
    vehicleId: number,
    payload: Partial<{
        vehicle_name: string, type: string, registration_number: string, daily_rent_price: number, availability_status: string;
    }>
    ) => {
        const existingRes = await pool.query(
    `
      SELECT vehicle_name, type, registration_number, daily_rent_price, availability_status
      FROM vehicles
      WHERE id = $1
    `,
    [vehicleId]
  );

   if (existingRes.rowCount === 0) return null;

    const existing = existingRes.rows[0];

    const vehicle_name = payload.vehicle_name ?? existing.vehicle_name;
    const type = payload.type ?? existing.type;
    const registration_number = payload.registration_number ?? existing.registration_number;
    const daily_rent_price = payload.daily_rent_price ?? existing.daily_rent_price;
    const availability_status = payload.availability_status ?? existing.availability_status;

    const result = await pool.query(`UPDATE vehicles SET vehicle_name=$1, type=$2, registration_number=$3, daily_rent_price=$4, availability_status=$5 WHERE id=$6 RETURNING ${VEHICLE_PUBLIC_FIELDS}`, [vehicle_name, type, registration_number, daily_rent_price, availability_status, vehicleId
            ]);

            return result.rows[0];
    };

const deleteVehicle = async(vehicleId: number) => {
    const activeRes = await pool.query(`SELECT 1 FROM bookings WHERE vehicle_id = $1 and status = 'active' LIMIT 1`, [vehicleId]);
    if ((activeRes.rowCount ?? 0) > 0){
        throw new Error("Cannot delete vehicle with active bookings");
    }
    const result = await pool.query(`DELETE FROM vehicles WHERE id=$1`, [vehicleId
        ]);

        return result.rowCount ?? 0;
};


export const vehicleServices = {
    createVehicle,
    getVehicle,
    getSingleVehicle,
    updateVehicle,
    deleteVehicle,
}