import express from "express"
import { jwtAuth } from "../middleware/jwt.js"
import { getAdminStats ,userdelete} from "../controllers/admincontrolers.js"
const router =express.Router()

router.get("/admin/stats",jwtAuth,getAdminStats)
router.delete("/admin/user/delete/:id",userdelete)

export default router