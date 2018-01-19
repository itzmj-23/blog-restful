var express       = require("express"),
app               = express(),
expressSanitizer  = require("express-sanitizer"),
bodyParser        = require("body-parser"),
mongoose          = require("mongoose"),
methodOverride    = require("method-override");

// APP CONFIG
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());                       // express-sanitizer must be always after body-parser, not before. it is a requirement.
app.use(methodOverride("_method"));


// MONGOOSE/MODEL CONFIG
var dburl = process.env.DATABASEURL || "mongodb://localhost/restful_blog_app"
console.log(dburl);
mongoose.connect(dburl);
// mongoose.connect("mongodb://test:test@ds145385.mlab.com:45385/blog");


var blogSchema = new mongoose.Schema({
   title: String,
   image: String,
   body: String,
   created: {type: Date, default: Date.now()}
});

var  Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
//    title: "Test Blog",
//    image: "https://unsplash.com/photos/1ddol8rgUH8",
//    body: "this is a body!"
// });

// RESTFUL ROUTES
app.get("/", function(req, res){
   res.redirect("/blogs");
})
app.get("/blogs", function(req, res){
   Blog.find({}, function(err, blogs){
      if(err){
         console.log(err);
      } else {
         res.render("index", {blogs: blogs});
      }
   })

});

// NEW ROUTE
app.get("/blogs/new", function(req, res){
   res.render("new");
});

// CREATE ROUTE
app.post("/blogs", function(req, res){
   // create blog
   console.log(req.body);
   req.body.blog.body = req.sanitize(req.body.blog.body);
   console.log(req.body);
   Blog.create(req.body.blog, function(err, newBlog){
      if(err){
         res.render("new");
      } else {
         res.redirect("/blogs");
      }
   });
})

// SHOW ROUTE
app.get("/blogs/:id", function(req, res){
   Blog.findById(req.params.id, function(err, foundBLog){
      if(err){
         console.log("SOMETHING WENT WRONG!");
         console.log(err);
      } else {
         res.render("show", {blog: foundBLog});
      }
   })
})

// EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res){
   Blog.findById(req.params.id, function(err, foundBlog){
      if(err){
         res.redirect("/blogs");
      } else {
         res.render("edit", {blog: foundBlog});
         // console.log(foundBlog);
      }
   })
});

// UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
   console.log(req.body);
   req.body.blog.body = req.sanitize(req.body.blog.body);
   console.log("=============");
   console.log(req.body);
   Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
      if(err){
         res.redirect("/blogs");
      } else {
         res.redirect("/blogs/" + req.params.id);
      }
   })
});

// DELETE ROUTE
app.delete("/blogs/:id", function(req, res){
   // destroy blog
   // redirect somewhere
   Blog.findByIdAndRemove(req.params.id, function(err){
      if(err){
         res.redirect("/blogs");
      } else {
         res.redirect("/blogs");
      }
   })
}) 

app.listen(process.env.PORT || 3000, function(){
   console.log("Server is running..");
});
