import { diskStorage } from "multer";

export const storageConfig = (folder:string) => diskStorage({
    destination: `uploads/${folder}`,
    filename: (res, file, cb) => {
        cb(null,Date.now() + '-' + file.originalname)
    }
})