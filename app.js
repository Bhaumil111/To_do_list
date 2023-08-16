//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.set('strictQuery', false);
mongoose.connect("mongodb://127.0.0.1:27017/ToDoListDB");
const itemSchema = {
  name: String
}

const Item = mongoose.model("Item", itemSchema);
const item1 = new Item({
  name: "Welcome to the To Do List"
})
const item2 = new Item({
  name: "Hit + button to add the new item"
})
const item3 = new Item({
  name: "Hit the <-- button to delete the item"
})

const defaultItems = [item1, item2, item3];
const listSchema = {
  name:String,
  items : [itemSchema]
}
const List = mongoose.model("List",listSchema);

app.get("/", function (req, res) {
  Item.find().then(function (foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems)
        .then(function () {
          console.log("Successfully saved defult items to DB");
        })
        .catch(function (err) {
          console.log(err);
        });
      res.redirect("/");
    }
    else {

      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  }).catch(function (err) {
    console.log(err);
  })


});
app.get("/:customlistname",function(req,res){
  const customlistname=_.capitalize( req.params.customlistname);
  List.findOne({name:customlistname}).then(function(foundList){
    if(!foundList){
      // console.log("Do not Exits!")
      const list = new List({
        name:customlistname,
        items :defaultItems
      }) ;
      list.save().then(()=>console.log("Success")); 
      res.redirect("/"+customlistname);
    }
    else{
      // console.log("Exits");
      res.render("list", { listTitle: customlistname, newListItems: foundList.items });
      
    }
  }).catch(function(err){
    console.log(err);
  })

})
app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
 
  const item = new Item({
    name: itemName
  })
  if(listName==="Today"){
    item.save().then(() => console.log('Item is Successfully Saved'));
    res.redirect("/");
  }
  else{
    List.findOne({name:listName}).then(function(foundList){
      if(foundList){
        foundList.items.push(item)
       
        foundList.save().then(()=>console.log("Success")); 
        res.redirect("/"+listName);
      }
      
    }).catch(function(err){
      console.log(err);
    })
    

  }
 
});
app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId).then(function () {
      console.log("Successfully Deleted the item from DB");
    }).catch(function (err) {
      console.log(err);
    });

  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}).then(function(foundList){
      console.log("Succesfully Removed And Updated");
    }).catch(function(err){
      console.log(err);
    })
    res.redirect("/"+listName);
  }



 

});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
