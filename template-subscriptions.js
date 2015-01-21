someCollection = new Mongo.Collection("someCollection");
posts = new Mongo.Collection("posts");

if (Meteor.isClient) {
  Template.demoButtons.events({
    'click #search': function(){
      Session.set("posts", false);
      Session.set("random", false);
      Session.set("search", true);
    },
    'click #posts': function(){
      Session.set("posts", true);
      Session.set("random", false);
      Session.set("search", false);
    },
    'click #random': function(){
      Session.set("posts", false);
      Session.set("random", true);
      Session.set("search", false);
    },
  });

  Template.demoSwitch.helpers({
    renderSearch: function(){ return Session.get("search"); },
    renderPosts: function(){ return Session.get("posts"); },
    renderRandom: function(){ return Session.get("random"); }
  });


  Session.set("renderSubscriptionTemplate", true);
  Template.templateWithSubscriptions.cacheManager = new SubsManager({
      // maximum number of cache subscriptions
      cacheLimit: 10,
      // any subscription will be expire after 5 minute, if it's not subscribed again
      expireIn: 5
  }); 

  Template.templateWithSubscriptions.subscriptions = function(){
    return [["TestSub"]];
  };

  Template.templateWithSubscriptions.events({
    'click #recomputeSubs': function( e, template ){
      template.subscriptionsChanged();
    }
  });

  Template.demoTemplateSubscriptions.helpers({
    renderSubsTemplate: function(){
      return Session.get("renderSubscriptionTemplate");
    },
    items: function(){
      return someCollection.find();
    }
  });

  Template.demoTemplateSubscriptions.events({
    'click #resetCache': function(){
      TemplateSubscriptions.cacheManager.reset();
    },
    'click #toggleTemplateWithSubscriptions': function(){
      Session.set("renderSubscriptionTemplate",!Session.get("renderSubscriptionTemplate"));
    }
  });

  Template.posts.subscriptions = function(){
    return [["posts",Session.get("postLimit") || 5]];
  }

  Template.posts.created = function(){
    Session.set("postLimit",5);
  }
  
  Template.posts.helpers({
    items: function(){
      return posts.find({},{limit: Session.get("postLimit")});
    }
  });
  Template.posts.events({
    "click #more": function(e,template) {
      Session.set("postLimit", Session.get("postLimit") + 5);
      template.subscriptionsChanged();
    }
  });

  Template.search.subscriptions = function(){
    if(Session.get("searchTerm") ){
      return [["TestSub",Session.get("searchTerm")]];
    }else{
      return [];
    }
  }
  
  Template.search.helpers({
    items: function(){
      return someCollection.find({text: new RegExp(Session.get("searchTerm"))});
    }
  });

  Template.search.events({
    "keyup #search": _.throttle(function(e,template) {
        var text = $(e.target).val().trim();
        Session.set("searchTerm",text);
        template.subscriptionsChanged();
      }, 200)
  });
}

if (Meteor.isServer) {
  Meteor.publish("TestSub",function(searchText){
    Meteor._sleepForMs(2000);
    if( searchText ){
      console.log( someCollection.find({text: new RegExp(searchText,"ig")}).fetch() );
      return someCollection.find({text: new RegExp(searchText,"ig")});
    }else{
      return someCollection.find();
    }
  });

  if( someCollection.find().count() === 0 ){
    for( i=0; i < 50; i++ ){
      someCollection.insert({text: "some item" + i});
    }
  }
  Meteor.publish("posts",function(limit){
    Meteor._sleepForMs(2000);
    return posts.find({},{limit: limit});
  });
  if( posts.find().count() === 0 ){
    for( i=0; i < 50; i++ ){
      posts.insert({title: "post" + i});
    }
  }
}
