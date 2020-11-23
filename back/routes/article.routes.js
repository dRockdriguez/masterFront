'use strict'

const express = require('express');
const ArticleController = require('../controllers/article.controler');

const router = express.Router();

const multipart = require('connect-multiparty')
const uploadFile = multipart({ uploadDir: './uploads/articles' });

router.get('/test', ArticleController.test)
router.post('/save', ArticleController.save)
router.get('/findAll/:last?', ArticleController.findAll)
router.get('/findOne/:id', ArticleController.getArticle)
router.put('/update/:id', ArticleController.update)
router.delete('/delete/:id', ArticleController.delete)
router.post('/upload/:id', uploadFile, ArticleController.upload)
router.get('/getImage/:image', ArticleController.getImage)
router.get('/search/:search', ArticleController.search)

module.exports = router;