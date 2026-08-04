import express from 'express';
import { allowRoles, protect } from '../middlewares/auth.middleware.js';
import {registerAssistant,getAssistantProfile} from "../controllers/assistant.controller.js"

const router = express.Router();


router.post('/update-profile' ,protect, allowRoles('assistant'), registerAssistant)
router.get('/get-profile', protect, allowRoles('assistant'), getAssistantProfile)



export default router
