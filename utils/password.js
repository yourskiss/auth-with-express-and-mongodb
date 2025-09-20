import bcrypt from 'bcrypt';

export const hashedPassword = async (value) => {
    const salt = await bcrypt.genSalt(12);
    return await bcrypt.hash(value, salt);
}

export const comparePassword = async (val1, val2) => {
    return await bcrypt.compare(val1, val2);
}

