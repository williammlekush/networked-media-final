
const app = {

   msgs: {
      LANDING: {
         HEADER: "Happy Birthday Sunhi!",
         COPY: `You gave me the perfect birthday present this year, so of course I had to try and one-up you. :) 
         I know,
          I know,
          "Not everything is a competition, Will", but you deserve my best, 
          everyday.
          So here's a little gift from us,
           to you. <3`
      },
      CLOSING: {
         COPY: `Sunhi,
         It's impossible to tell you how much I love you.
         You've brought so much joy into my life and the lives of everyone around you...
         it's astounding.
          Of course,
          this hasn't been easy.
          We've been at each other's throats at times.
          It's been messy,
          but it's been ours.
         And I wouldn't trade any of it for the world.
          I love you.
          I love you.
          I love you,
          every
          single
          day.
          And with that,
          we've reached the end of people being sappy... oh,
          wait,
          hold on. 
          Sorry, the internet is saying there's something more? Yes, oh right...`
      },
      GALLERY: {
         FIRST: `Welcome to the gallery! For you to come back to whenever
         you need a reminder of all the people who care about you.`
      }
   },

   contentTypes: {
      LTR: "letter",
      LTRHAND: "letter-hand",
      VID: "video",
      IMGS: "images",
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

   devSpeed: 20,

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

      app.hideAllTemplates();

      await app.fillContentTemplate(contentParams);

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
               app.msgs.CLOSING.COPY.length * app.devSpeed + 8000
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
      for (type of fillParams.types) {
         console.log(type);

   fillContentTemplate: async function({ key, types }) {
      console.log(types);
      for (type of types) {
         switch(type) {
            case app.contentTypes.LTR:
               await app.addLetter(fillParams);
               break;
            case app.contentTypes.VID:
               await app.addVideo(fillParams);
               break;
            case app.contentTypes.LTRHAND:
               await app.addLetterHand(fillParams);
               break;
            case app.contentTypes.IMGS:
               await app.addImages(fillParams);
               break;
            default:
               break;
         }
      }
   },

   addLetter: async function({ textPath, font }) {
      const text = (await app.getText(textPath)).replace(/\r\n/g, "<br />");

      const textSplit = text.split("<br /><br />");

      let fontFam = font;

      if (fontFam == "") {
         fontFam = "Arvo"
      }

      $("<div>")
         .addClass("ltr-wrapper")
         .appendTo(app.elems.TEMPLATES.HBDAYCONTENT.CONTENT)

      const ltrWrap = ".ltr-wrapper";

      $("<h2>")
         .html(textSplit[0])
         .css("font-family", `${fontFam}, cursive`)
         .addClass("point-36")
         .appendTo(ltrWrap);

      $("<p>")
         .html(textSplit
            .slice(1, textSplit.length - 1)
            .join("<br /><br />"))
         .css("font-family", `${fontFam}, cursive`)
         .addClass("point-28 margin-up-32")
         .appendTo(ltrWrap);

      $("<h2>")
         .html(textSplit[textSplit.length - 1])
         .css("font-family", `${fontFam}, cursive`)
         .addClass("point-36 margin-up-32")
         .appendTo(ltrWrap);

      $(".ltr-wrapper").css("width", "100%");
   },

   addVideo: async function({ titlePath, link }) {
      const title = await app.getText(titlePath);

      $("<h2>")
         .html(title)
         .addClass("point-36")
         .appendTo(app.elems.TEMPLATES.HBDAYCONTENT.CONTENT);

      $("<iframe>")
         .attr(
            {
               class: "video",
               src: link,
               frameborder: "0",
               allow: "autoplay; fullscreen",
               allowfullscreen: "",
            })
         .addClass("margin-up-32")
         .appendTo(app.elems.TEMPLATES.HBDAYCONTENT.CONTENT);
   },

   addLetterHand: function(letterPath) {
      $("<img>")
         .attr({
            "src": letterPath,
            "alt": "letter from a friend",
         })
         .addClass("ltr-hand")
         .appendTo(app.elems.TEMPLATES.HBDAYCONTENT.CONTENT);         
   },

   addImages: function(imgPaths) {
      $("<div>")
         .addClass("ltr-img-wrapper")
         .appendTo(app.elems.TEMPLATES.HBDAYCONTENT.CONTENT)

      $("<div>")
         .addClass("masonry-sizer")
         .appendTo(".ltr-img-wrapper")

      imgPaths.forEach(
         imgPath => {
            $("<img>")
               .attr("src", `${imgPath}`)
               .addClass("ltr-img")
               .appendTo(".ltr-img-wrapper");
         });

      const imgCount = imgPaths.length;

      if (imgCount > 5) {
         $(".ltr-img").addClass("col-3");
      } else if (imgCount > 3) {
         $(".ltr-img").addClass("col-2");
         $(".masonry-sizer").css("width", "50%");
      } else {
         $(".ltr-img").addClass("col-1");
         $(".masonry-sizer").css("width", "100%");
      }

      const masonry = $(".ltr-img-wrapper")
         .masonry({
            itemSelector: ".ltr-img",
            columnWidth: ".masonry-sizer",
            percentPosition: true,
         })

      masonry
         .imagesLoaded()
         .progress(() => masonry.masonry("layout"));
   },

   getText: async function(filePath) {
      return await $.get(filePath, "text");
   },

   getContentKeys: async function() {
      return await $.get("/keys");
   },

   getContentTypes: async function(contributor) {
      return await $.get("/types", { key: contributor });
   },

   getTextParams: async function(contributor) {
      return await $.get("/text-params", { key: contributor });
   },

   getVideoLink: async function(contributor) {
      return await $.get("/video-link", { key: contributor });
   },

   getLetterHandPath: async function(contributor) {
      return await $.get("/letter-hand-path", { key: contributor });
   },

   getImagePaths: async function(contributor) {
      return await $.get("/image-paths", { key: contributor });
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