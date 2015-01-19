someCollection = new Mongo.Collection("someCollection");

if (Meteor.isClient) {
  Session.set("renderSubscriptionTemplate", true);
  TemplateSubscriptions.cacheManager = new SubsManager({
      // maximum number of cache subscriptions
      cacheLimit: 10,
      // any subscription will be expire after 5 minute, if it's not subscribed again
      expireIn: 5
  }); 

  Template.templateWithSubscriptions.subscriptions = function(){
    return [["TestSub"]];
  };

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
}

if (Meteor.isServer) {
  Meteor.publish("TestSub",function(){
    Meteor._sleepForMs(2000);
    return someCollection.find();
  });

  if( someCollection.find().count() === 0 ){
    someCollection.insert({text: "some item"});
  }
}
