
const app = {

   msgs: {
      LANDING: {
         HEADER: "Happy Birthday Sunhi!",
         COPY: `This is my best attempt at one-upping your perfect birthday gift for me this year.
         I know,
          I know,
          "Not everything is a competition, Will", but you deserve my best, 
          everyday.
          So here's a little gift from us,
           to you. <3`
      },
      CLOSING: {
         COPY: `I hope you feel half as loved as you've made me feel over the last year.
         You've brought so much joy into my life and the lives of everyone around you,
         so thank you, from all of us. Now, we've reached the end of people being sappy... oh,
         wait, hold on. Sorry, the internet is saying there's something more? Yes, oh right...`
      },
      GALLERY: {
         FIRST: `Welcome to the gallery! For you to come back to whenever
         you need a reminder of all the people who care about you.`
      }
   },

   contentTypes: {
      LTR: "letter",
      LTRIMG: "letter-images",
      VID: "video"
   },

   elems: {
      HEADER: {
         HEADER: ".header-gallery",
         BTNS: {
            INPUT: ".btn-input",
            HBDAY: ".btn-hbday"
         },
         TITLE: ".title-gallery",
         INMSG: ".msg-input",
      },
      TEMPLATES: {
         LANDING: {
            SECTION: "#landing",
            HEADER: "#msg-hbday",
            COPY: ".copy-landing"
         },
         CLOSING: {
            SECTION: "#closing",
            COPY: ".copy-closing",
         },
         GALLERY: {
            SECTION: "#gallery",
            MSG: "#msg-gallery"
         },
         HBDAYCONTENT: {
            SECTION: "#hbday-content",
            CONTENT: ".content-hbday"
         }
      },
      HBDAYBTNS: {
         WRAPPER: "#btn-wrapper-hbday-nav",
         NEXT:".btn-next",
         GALLERY: ".btn-gallery",
      },
      FORMS: {
         LOGIN: ".form-login"
      }
   },

   contentKeys: [],

   openingIndex: 0,

   devSpeed: 10,

   init: async function() {  
      app.enableBtns();

      app.contentKeys = await app.getContentKeys();
      const skipHbday = await $.get("/hbday-done");

      if (skipHbday) {
         app.transitionGallery({firstTime: false});
      } else {
         app.landingPage();
      }

   },

   landingPage: async function() {
      app.clearTypedMsgs();
      $(app.elems.TEMPLATES.GALLERY.MSG).hide(500);
      $(app.elems.TEMPLATES.LANDING.SECTION).fadeIn(500).css("display", "flex");

      app.typeWrite(
         {  txt: app.msgs.LANDING.HEADER, 
            target: app.elems.TEMPLATES.LANDING.HEADER,
            speed: app.devSpeed,
         });

      setTimeout(
         () => {
            $(app.elems.TEMPLATES.LANDING.HEADER)
            .removeClass("point-64")
            .addClass("point-48")
            .css("margin-top", "16%")

            setTimeout(
               () => {
               app.typeWrite(
                  {  txt: app.msgs.LANDING.COPY,
                     target: app.elems.TEMPLATES.LANDING.COPY,
                     speed: app.devSpeed,
                  });
               
               setTimeout(
                  () => {
                     $(app.elems.HBDAYBTNS.WRAPPER).fadeIn(500).css("display", "flex");
                  },
                  app.msgs.LANDING.COPY.length * app.devSpeed + 3000
               )
               },
               1000);
         },
         app.msgs.LANDING.HEADER.length * app.devSpeed + 300
         );  
      
   },

   transitionOpening: function() {
      if (app.openingIndex < app.contentKeys.length) {

         app.transitionContentTemplate(app.contentKeys[app.openingIndex]);

         app.openingIndex += 1;
      } else {
         $(app.elems.HBDAYBTNS.NEXT).hide(500);
         app.closing();
      }
   },

   transitionContentTemplate: async function(contentKey) {
      const contentParams = await app.getContentParams(contentKey);

      app.clearContent();

      await app.fillContentTemplate(contentParams);

      app.hideAllTemplates();

      $(app.elems.TEMPLATES.HBDAYCONTENT.SECTION).show(500);      
   },

   closing: async function() {
      app.hideAllTemplates();

      $(app.elems.TEMPLATES.CLOSING.SECTION).show(500, 
         () => {
            app.typeWrite(
               {  txt: app.msgs.CLOSING.COPY,
                  target: app.elems.TEMPLATES.CLOSING.COPY,
                  speed: app.devSpeed
               });
      
            setTimeout(
               () => $(app.elems.HBDAYBTNS.GALLERY).fadeIn(500).css("display", "flex"),
               app.msgs.CLOSING.COPY.length * app.devSpeed + 4000
            )
      });

      await $.post("/hbday-done");
   },

   transitionGallery: function({ firstTime = true }) {
      app.hideAllTemplates();
      app.clearTypedMsgs();
      app.clearContent();
      $(app.elems.HBDAYBTNS.WRAPPER).hide(500);

      app.contentKeys.forEach(
         async key => {
            app.fillGallery(Object.assign({ linkKey: key }, await this.getGalleryParams(key)));
         }
      )   

      $(app.elems.TEMPLATES.GALLERY.SECTION).show(500);
      $(app.elems.HEADER.HEADER).show(500).css("display", "flex");

      if (firstTime) {
         $(app.elems.TEMPLATES.GALLERY.MSG).show();

         setTimeout(
            app.typeWrite(
               {  txt: app.msgs.GALLERY.FIRST,
                  target: app.elems.TEMPLATES.GALLERY.MSG,
                  speed: app.devSpeed,
               }),
            1500);

      }
   },

   clearContent: function() {
      $(".content").empty()
   },

   clearTypedMsgs: function() {
      $(app.elems.TEMPLATES.LANDING.HEADER).html("");
      $(app.elems.TEMPLATES.LANDING.COPY).html("");
      $(app.elems.TEMPLATES.CLOSING.COPY).html("");
      $(app.elems.TEMPLATES.GALLERY.MSG).html("");
   },

   fillGallery: async function({ linkKey, thumbnailPath, captionPath }) {
      const caption = await app.getText(captionPath);
      const gallery = ".content-gallery";


      $("<div>")
      .css("background-image", `url(${thumbnailPath})`)
      .addClass("thumbnail")
      .appendTo(gallery)
      .append(
         $("<p>")
         .text(caption)
         .addClass("thumbnail-caption point-18")
         .click(() => {
            app.transitionContentTemplate(linkKey);
            
            $(app.elems.HEADER.BTNS.BACK).show()
         }));
   },

   fillContentTemplate: async function(fillParams) {
      switch(fillParams.type) {
         case app.contentTypes.LTR:
            await app.fillLetterTemplate(fillParams);
            break;
         case app.contentTypes.LTRIMG:
            await app.fillLetterImagesTemplate(fillParams);
            break;
         case app.contentTypes.VID:
            await app.fillVideoTemplate(fillParams);
            break;
      }

      $(app.elems.TEMPLATES.HBDAYCONTENT.CONTENT).addClass(`content-${fillParams.type}`);
   },

   fillLetterTemplate: async function(templateParams) {
      await app.fillLetterText({ textPath: templateParams.text, font: templateParams.font });
      $(".ltr-wrapper").css("width", "100%");
   },

   fillLetterImagesTemplate: async function(templateParams) {
      await app.fillLetterText({ textPath: templateParams.text, font: templateParams.font });

      $("<div>")
      .addClass("ltr-img-wrapper margin-left-32")
      .appendTo(app.elems.TEMPLATES.HBDAYCONTENT.CONTENT)

      templateParams.imgs.forEach(
         imgPath => {
            $("<div>")
            .css("background-image", `url(${imgPath})`)
            .addClass("ltr-img margin-up-32")
            .appendTo(".ltr-img-wrapper");
         });
   },

   fillVideoTemplate: async function(templateParams) {
      const title = await app.getText(templateParams.text);

      console.log(title);

      $("<h2>")
      .html(title)
      .addClass("point-48")
      .appendTo(app.elems.TEMPLATES.HBDAYCONTENT.CONTENT);

      $("<iframe>")
      .attr(
         {
            class: "video",
            src: templateParams.vid,
            frameborder: "0",
            allow: "autoplay; fullscreen",
            allowfullscreen: "",
         })
      .addClass("margin-up-32")
      .appendTo(app.elems.TEMPLATES.HBDAYCONTENT.CONTENT);
   },

   fillLetterText: async function({ textPath, font} ) {
      const text = (await app.getText(textPath)).replace(/\r\n/g, "<br />");

      const textSplit = text.split("<br /><br />");

      let fontFam = font;
      if (font == "") {
         fontFam = "Arvo"
      }

      $("<div>")
      .addClass("ltr-wrapper")
      .appendTo(app.elems.TEMPLATES.HBDAYCONTENT.CONTENT)

      const ltrWrap = ".ltr-wrapper";

      $("<h2>")
      .html(textSplit[0])
      .css("font-family", fontFam)
      .addClass("point-36")
      .appendTo(ltrWrap);

      $("<p>")
      .html(textSplit.slice(1, textSplit.length - 1).join("<br /><br />"))
      .css("font-family", fontFam)
      .addClass("point-28 margin-up-32")
      .appendTo(ltrWrap);

      $("<h2>")
      .html(textSplit[textSplit.length - 1])
      .css("font-family", fontFam)
      .addClass("point-36 margin-up-32")
      .appendTo(ltrWrap);
   },

   getText: async function(filePath) {
      return await $.get(filePath, "text");
   },

   getContentKeys: async function() {
      return await $.get("/keys");
   },

   getContentParams: async function(contentKey) {
      return await $.get("/content", { key: contentKey });
   },

   getGalleryParams: async function(galleryKey) {
      return await $.get("/gallery", { key: galleryKey })
   },

   hideAllTemplates: function() {
      $.each(
         app.elems.TEMPLATES,
         (key, value) => {
            $(value.SECTION).hide(500);
            $(value).hide(500);
         });
   },

   enableBtns: function() {
      $(app.elems.HBDAYBTNS.NEXT).click(() => app.transitionOpening());
      $(app.elems.HBDAYBTNS.GALLERY).click(() => app.transitionGallery({}));

      $(app.elems.HEADER.BTNS.INPUT).click(() => {
         $(app.elems.HEADER.INMSG).show(500);

         setTimeout(() => $(app.elems.HEADER.INMSG).hide(500), 10000);
      });
      $(app.elems.HEADER.TITLE).click(() => app.transitionGallery({firstTime: false }));

      $(app.elems.HEADER.BTNS.HBDAY).click(() => {
         $(app.elems.HEADER.HEADER).hide(500);
         $(app.elems.HBDAYBTNS.GALLERY).hide();
         $(app.elems.HBDAYBTNS.NEXT).css("display", "flex");
         app.openingIndex = 0;
         app.clearContent();
         app.landingPage();
      });
   },
   
   typeWrite: function({ txt, target, speed }) {
      let i = 0;

      const writing = setInterval(
         () => {
            if (i < txt.length) {
               $(target).append(txt[i]);
               i ++;
            } else {
               clearInterval(writing);
            }
         }, speed
      );
   },
}

$(() => app.init())