import { promises as fs } from 'fs';

 const exists = async (file: string): Promise<boolean> => {
    try {
        await fs.access(file)
        return true
    } catch {
        return false
    }
}

export default exists;