import { z }  from "zod";
const schema = z.coerce.number().min(10).max(65535).default(80);
export const PORT = schema.parse(process.env.PORT);