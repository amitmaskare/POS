import multer from 'multer'
import path from 'path'
import fs from 'fs'


const createuploadFile=(folderName='')=>{
    const uploadBasePath=`public/uploads/${folderName}`

    if(!fs.existsSync(uploadBasePath))
    {
        fs.mkdirSync(uploadBasePath,{recursive:true})
    }

    const storage=multer.diskStorage({
        destination:function(req,file,cb)
        {
            cb(null,uploadBasePath)
        },
        filename:function(req,file,cb)
        {
            const ext=path.extname(file.originalname)
            const uniqueName=`${Date.now()}-${Math.round(Math.random()*1E9)}${ext}`
            cb(null,uniqueName)
        }
    })

    const fileFilter=(req,file,cb)=>{
        const allowedTypes = /jpeg|JPG|jpg|png|PNG/;
        const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = allowedTypes.test(file.mimetype);
        if (extName && mimeType) {
            return cb(null, true);
        } else {
            cb(new Error('Only jpeg|jpg|png|PNG are allowed'));
        }
    }

    return multer({
        storage,
        fileFilter,
        limits:{fileSize:2*1024*1024}
    })
}

export default createuploadFile