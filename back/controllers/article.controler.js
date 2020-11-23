'use strict'

const validator = require('validator');
const Article = require('../models/article');
const fileSystem = require('fs');
const path = require('path');

const controller = {
    test: (request, response) => {
        return response.status(200).send(`
            <h2>Estoy funcionando</h2>
        `);
    },
    save: (request, response) => {
        const params = request.body;

        try {
            const validateTitle = !validator.isEmpty(params.title);
            const validateContent = !validator.isEmpty(params.content);

            if (validateTitle && validateContent) {
                const article = new Article();
                article.title = params.title;
                article.content = params.content;
                article.image = null;

                article.save();

                return response.status(200).send({
                    error: false,
                    article
                });
            } else {
                return response.status(200).send({
                    error: true,
                    message: 'Los datos del artículo no son correctos.'
                });
            }

        } catch (err) {
            return response.status(500).send({
                error: true,
                message: 'Ha ocurrido un error. '
            });
        }

    },
    findAll: (request, response) => {
        const last = request.params.last;

        const query = Article.find({});
        if (last) {
            query.limit(5);
        }

        query.sort('-_id').exec((err, articles) => {
            if (err) {
                return response.status(200).send({
                    error: true,
                    message: 'Ha ocurrido un error recuperando los artículos.'
                });
            }
            return response.status(200).send({
                error: false,
                articles
            });
        });
    },
    getArticle: (request, response) => {
        const id = request.params.id;

        if (!id) {
            return response.status(400).send({
                error: false,
                message: 'Debe pasar el id.'
            });
        }
        Article.findById(id, (err, article) => {
            if (err) {
                return response.status(404).send({
                    error: true,
                    message: 'No existe el artículo.'
                });
            }

            return response.status(200).send({
                error: false,
                article
            });
        });
    },
    update: (request, response) => {
        const id = request.params.id;

        if (!id) {
            return response.status(300).send({
                error: false,
                message: 'Debe pasar el id.'
            });
        }

        const params = request.body;

        try {
            const validateTitle = !validator.isEmpty(params.title);
            const validateContent = !validator.isEmpty(params.content);

            if (validateTitle && validateContent) {
                Article.findOneAndUpdate({ _id: id }, params, { new: true }, (err, article) => {
                    if (err) {
                        return response.status(500).send({
                            error: true,
                            message: 'Error al actualizar.'
                        });
                    }
                    return response.status(200).send({
                        error: false,
                        article
                    });
                });

            } else {
                return response.status(200).send({
                    error: true,
                    message: 'Los datos del artículo no son correctos.'
                });
            }

        } catch (err) {
            return response.status(500).send({
                error: true,
                message: 'Ha ocurrido un error. '
            });
        }
    },
    delete: (request, response) => {
        const id = request.params.id;

        if (!id) {
            return response.status(400).send({
                error: false,
                message: 'Debe pasar el id.'
            });
        }

        Article.findOneAndDelete({ _id: id }, (err, article) => {
            if (err) {
                return response.status(500).send({
                    error: true,
                    message: 'Error al eliminar.'
                });
            }

            return response.status(200).send({
                error: false,
                message: 'Artículo eliminado. '
            });

        })
    },
    upload: (request, response) => {
        // Configurar el módulo connect multiparty router/article.js
        const fileName = 'Imágen no subida';
        if (!request.files) {
            return response.status(400).send({
                error: true,
                message: 'No ha subido ninguna imágen. '
            });
        }

        const filePath = request.files.file0.path;
        const name = filePath.split('\\')[2];
        const type = name.split('\.')[1];

        if (type !== 'png' && type !== 'jpg' && type !== 'jpeg' && type !== 'gif') {
            // Borrar el archivo
            fileSystem.unlink(filePath, (err) => {
                return response.status(500).send({
                    error: true,
                    message: 'Ha ocurrido un error. '
                });
            });
            return response.status(400).send({
                error: true,
                message: 'Fichero no válido. '
            });
        }

        const id = request.params.id;

        if (!id) {
            return response.status(400).send({
                error: false,
                message: 'Debe pasar el id.'
            });
        }

        Article.findOneAndUpdate({ _id: id }, { image: name }, { new: true }, (err, article) => {
            if (err) {
                return response.status(500).send({
                    error: true,
                    message: 'Ha ocurrido un error.'
                });
            }

            return response.status(200).send({
                error: false,
                article
            });
        })
    },
    getImage: (request, response) => {
        const image = request.params.image;

        if (!image) {
            return response.status(400).send({
                error: true,
                message: 'Debe pasar la imágen.'
            });
        }

        const pathFile = './uploads/articles/' + image;
        fileSystem.stat(pathFile, (err, image) => {
            if (err) {
                return response.status(404).send({
                    error: true,
                    err
                });
            }
            return response.status(200).sendFile(path.resolve(pathFile));

        });
    },
    search: (request, response) => {
        const searchText = request.params.search;

        if (!searchText) {
            return response.status(400).send({
                error: true,
                message: 'Debe pasar el texto a buscar.'
            });
        }

        Article.find({
            "$or": [
                { "title": { "$regex": searchText, "$options": "i" } },
                { "content": { "$regex": searchText, "$options": "i" } },
            ]
        })
        .sort([['date', 'descending']])
        .exec((err, articles) => {
            if(err) {
                return response.status(500).send({
                    error: true,
                    message: 'Ha ocurrido un eror.',
                    err
                });
            }

            return response.status(200).send({
                error: false,
                articles
            });
        });
    }

};


module.exports = controller;