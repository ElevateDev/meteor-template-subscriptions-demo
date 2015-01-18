someCollection = new Mongo.Collection("someCollection");

if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault("counter", 0);

  Template.hello.helpers({
    counter: function () {
      return Session.get("counter");
    }
  });

  Template.hello.subscriptions = function(){
    return [["TestSub"]];
  };

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set("counter", Session.get("counter") + 1);
    }
  });
}

if (Meteor.isServer) {
  Meteor.publish("TestSub",function(){
    Meteor._sleepForMs(2000);
    return someCollection.find();
  });
}
