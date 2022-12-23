const router = require('express').Router()
const memberCtrl = require('../controllers/MemberCtrl')
const authM = require('../middleware/authM')

router.post('/register', memberCtrl.register)

router.post('/activation/:token', memberCtrl.activateEmail)

router.post('/login', memberCtrl.login)

router.get('/refresh_token', memberCtrl.getAccessToken)

router.get('/meal_plan', memberCtrl.getAllmealplans);

router.get('/workout',  memberCtrl.getAllworkouts)

router.post('/forgotpw', memberCtrl.forgotPW)

router.get('/allmember_info', memberCtrl.getAllMembers)


router.post('/resetpw', authM, memberCtrl.resetPW)

router.get('/info', authM, memberCtrl.getMemberInfo)

router.get('/logout',  memberCtrl.logout)

router.patch('/update', authM, memberCtrl.updateMember) 


module.exports = router