const userModel = require("../../models/user/user");
const articleModel = require("../../models/article/article");
const fs = require("fs");
const upload = require("../../middleware/upload");
const util = require("util");

const articleController = {
    createArticleForm: async (req, res) => { 
        /**
         * Directs user to a form to write their article
         */
        let user = null;
        try {
            user = await userModel.findOne({ email: req.session.user });
        } catch (err) {
            console.log(err);
            res.redirect("/users/login");
            return;
        };

        res.render("pages/create-new-article", {user});
    },

    createArticle: async (req, res, next) => {
        /**
         * Creates a new post with the following steps:
         * #1. Get user data (Object_id) from DB using session (from incoming request)
         * #2. Create a DB record for the article
         * Finally, return user to the article's view URL
         */
        const user = await userModel.findOne({ email: req.session.user });
        const userId = user._id.toHexString(); // _id field returns: new ObjectId("62ef8bedf6cd6747dcbfb312")
        console.log("this is req.body: ", req.body);
        console.log("this is req.file: ", req.file);

        try {
            const createdArticle = await articleModel.create({
                title: req.body.title,
                genre: req.body.genre,
                author: userId,
                content: req.body.content,
                imgName: req.file.filename
            });

            // Return user to article page
            res.redirect(`/articles/articleid/${createdArticle._id}`);

        } catch (err) {
            console.log(err);
            res.send("failed to create article");
            return;
        };        
    },

    getArticle: async (req, res) => {
        /**
         * Displays the article page. Fetch the article object from DB (articles), 
         * then pass it as props into the article page to render
         */
        const createdArticle = await articleModel.findById(req.params.articleId);
        const userAuthor = await userModel.findById(createdArticle.author);

        res.render("pages/article", {createdArticle, userAuthor});
    },

    deleteArticle: async (req,res) => {
        /**
         * Deletes the article. Fetches the article object from DB (to get ObjectId),
         * executes mongoose delete
         */
        // console.log("inside deleteArticle");
        const createdArticle = await articleModel.findById(req.params.articleId);
        const createdArticleFileName = createdArticle.imgName;
        // console.log("identified file to delte: " + createdArticleFileName);
        const createdArticleId = createdArticle._id.toHexString();
        try {
            await articleModel.deleteOne({ _id: createdArticleId });
            fs.unlink(`./public/uploads/${createdArticleFileName}`, (err) => {
                if (err) {
                    console.log(err);
                    return;
                };
            });
        } catch (err) {
            res.send("article cannot be deleted");
        };
        res.redirect("/users/dashboard");
    },

    getArticleByGenre: async (req, res) => {
        /**
         * Queries the DB for article objects by genre (to get the ObjectId)
         * Similar to how home page is being rendered
         */
        try {
            const genre = req.params.genre;
            const createdArticles = await articleModel.find({"genre": genre});
            res.render("pages/genre", {genre, createdArticles});
        } catch (err) {
            res.send("error 4000");
            return;
        }
    },

    editArticleForm: async (req, res) => {
        /**
         * Returns a form populated with the articleId's contents in an editable form
         */
        const createdArticle = await articleModel.findById(req.params.articleId);
        const userAuthor = await userModel.findById(createdArticle.author);
        
        try {
            res.render("pages/edit-article", {createdArticle, userAuthor});
        } catch(err) {
            res.send("error 4000");
            return;
        };
    },

    editArticle: async (req, res, next) => {
        /**
         * Queries the DB for the specific record, and updates it. Redirects user to the article
         */
        const articleId = { _id: req.params.articleId };
        const user = await userModel.findOne({ email: req.session.user });
        const userId = user._id.toHexString();

        const update = {
            title: req.body.title,
            genre: req.body.genre,
            author: userId,
            content: req.body.content,
            imgName: req.file.filename
        };

        try {
            const updatedArticle = await articleModel.findOneAndUpdate(articleId, update);
            res.redirect(`/articles/articleid/${updatedArticle._id}`);
        } catch (err) {
            console.log(err);
            res.send("failed to update article");
            return;
        };

    },
};
module.exports = articleController;