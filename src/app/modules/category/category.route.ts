import express from 'express';
import { CategoryController } from './category.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';
import { CategoryValidations } from './category.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

router.route("/")
    .post(auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),validateRequest(CategoryValidations.createCategorySchema),CategoryController.createCategory)
    .get(CategoryController.getAllCategories);
    
router.route("/user-types")
    .get(CategoryController.getAllUserTypes)
    .post(auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),fileUploadHandler(),validateRequest(CategoryValidations.createUserTypeSchema),CategoryController.createUserType);

router.route("/user-types/:id")
    .delete(auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),CategoryController.deleteUserTypeById)
    .patch(auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),fileUploadHandler(),validateRequest(CategoryValidations.updateUserTypeSchema),CategoryController.updateCategoryById);

router.route("/:id")
    .delete(auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),CategoryController.deleteCategoryById);


export const CategoryRoutes = router;
