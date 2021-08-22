const express = require("express");
const bparser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// console.log(date());

const app = express();

app.use(bparser.urlencoded({extended:true}));
app.use(express.static(__dirname+"/public"));
app.set('view engine', 'ejs');

mongoose.connect("mongodb://localhost:27017/todoListDB",{useNewUrlParser:true,useUnifiedTopology: true});

const itemsSchema = {
    name : String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
    name : "welcome to your to-do list."
});
const item2 = new Item({
    name : "hit + button to add new item."
});
const item3 = new Item({
    name : "<-- hit this to delete an item."
});

const defaultItems = [item1,item2,item3];

app.get("/",function(req,res){

    Item.find({},function(err,foundItems){
        if(err)
        {
            console.log(err);
        }
        else
        {
            if(foundItems.length === 0)
            {
                Item.insertMany(defaultItems,function(err){
                    if(err)
                    {
                        console.log(err);
                    }
                    else
                    {
                        console.log("successfully saved default items to DB.")
                    }
                    res.redirect("/");
                });
            }
            else
            {
                console.log(foundItems);
                res.render("list",{listTitle : "Today",newListItems : foundItems});
            }
        }
    }); 
});

const listSchema = {
    name : String,
    items : [itemsSchema]
}
const List = mongoose.model("List",listSchema);

app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name : customListName},function(err,foundList){
        if(err)
        {
            console.log(err);
        }
        else
        {
            if(!foundList)
            {
                const list = new List({
                    name : customListName,
                    items : defaultItems
                });
                list .save();
                res.redirect("/"+customListName);
            }
            else
            {
                if(foundList.items.length === 0)
                {
                     console.log(foundList.items);
                     foundList.items = defaultItems;
                     foundList.save();
                }
                res.render("list",{listTitle : foundList.name,newListItems : foundList.items});
            }
        }
    });
    

});



app.post("/",function(req,res){
    let itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name : itemName
    });

    if(listName === "Today")
    {
        item.save();
        res.redirect("/");
        // console.log(req.body);
    }
    else
    {
        List.findOne({name:listName},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName)
        });
    }
   
//    console.log(item);
});

app.post("/work",function(req,res){
    let item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
});

app.post("/delete",function(req,res){
    const checkedItemID = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today")
    {
        Item.deleteOne({_id : checkedItemID},function(err){
            if(err)
            {
                console.log(err);
            }
            else
            {
                console.log("Deleted Successfully");
            }
            res.redirect("/");
        });
        // console.log(checkedItemID);
    }
    else
    {
        List.findOneAndUpdate({name : listName},{$pull : {items : {_id : checkedItemID}}},function(err,foundList){
            if(err)
            {
                console.log(err);
            }
            else
            {
                res.redirect("/"+listName);
            }
        });
    }
    
});

app.listen(3000,function(){
    console.log("Port created at 3000");
});
