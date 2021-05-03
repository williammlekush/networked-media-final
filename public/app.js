const app = {

   templates: {
      landing: "#landing",
      letter: "#letter",
      letterPhotos: "#letter-photos",
      video: "#video",
      closing: "#closing",
      gallery: "#gallery",
   },

   btns: {
      next: ".btn-next",
      login: ".btn-login"
   },

   forms: {
      login: ".form-login",
   },

   contentParams: [],

   init: function() {      
      $.each(app.templates, (key, value) => $(value).hide());
      app.landingPage();
   },

   landingPage: function() {
      $(app.templates.landing).show();
      $(app.btns.login).click(() => app.content());
   },

   content: function() {
      $.get("/keys")
      .done(data => data.forEach(key => app.getContent(key)))
      .then(() => console.log(app.contentParams));

      $(app.templates.landing).hide();
      $(app.templates.letter).show();
      
      $(app.btns.next).click(() => {app.nextContent()});
   },

   nextContent: function() {

   },

   getContent: function(contentKey) {
      $.get("/content", { key: contentKey })
      .done(data => app.contentParams.push(data));
   },
}

$(() => app.init())