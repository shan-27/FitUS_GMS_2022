const router = require('express').Router()
const instructorCtrl = require('../controllers/InstructorCtrl')
const authI = require('../middleware/authI')
const authAdmin = require('../middleware/authAdmin')
const authM = require('../middleware/authM')


router.put('/member_group', instructorCtrl.addMembersToGroup)

router.patch('/role/update', instructorCtrl.updateRole);


router.post('/register', instructorCtrl.register)

router.post('/activation/:token', instructorCtrl.activateEmail)

router.post('/login', instructorCtrl.login)

router.post('/refresh_token', instructorCtrl.getAccessToken)

router.post('/forgotpw', instructorCtrl.forgotPW)

router.post('/resetpw', authI, instructorCtrl.resetPW)

router.get('/info', authI, instructorCtrl.getInstructorInfo)
router.get('/messages', instructorCtrl.getAllmessages)
router.post('/messages', instructorCtrl.addMessage)


router.post('/meal_plan',  instructorCtrl.createMealPlan)
router.post('/exercies_plan',  instructorCtrl.createExercies)

router.get('/exercies_plan',  instructorCtrl.getExercies)
router.get('/meal_plan',  instructorCtrl.getMeals)



router.get('/logout', instructorCtrl.logout)

router.get('/allinstructor_info', instructorCtrl.getAllinstructors)

router.get('/allmember_info', authI, authAdmin, instructorCtrl.getAllmembers)

router.patch('/update', authI, instructorCtrl.updateInstructor)



router.delete('/deleteIns/:id', authI, authAdmin, instructorCtrl.deleteInstructor)

router.delete('/deleteMem/:id', authI, authAdmin, instructorCtrl.deleteMember)

router.patch('/update_role/:id', authI, authAdmin, instructorCtrl.updateRole) 

module.exports = router