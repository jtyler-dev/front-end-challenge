"use strict";
var productModule = (function() {
    var page;

    /**
    * domObj is the state object for out application
    **/
    var domObj = function () {
        var self        = this;
        self.products   = [];
        self.template   = "";

        var loadTemplate = function(templateUrl) {
            return $.get(templateUrl, function(template){
                self.template = template;
            });
        };

        // getter for the template
        var getTemplate = function () {
            return self.template;
        };

        // add product to our list
        var addProduct = function(product) {
            self.products.push(product);
        };

        // update the dom with the new
        var updateDom = function(){
            var thishtml="<div class='row row-flex row-flex-wrap'>";
            for(var i=0; i< self.products.length ; i++){
              thishtml += self.products[i].getHtmlView();
            }
            thishtml += "</div>";
            $("#content").append(thishtml);
        };

        return{
            updateDom:updateDom,
            getTemplate:getTemplate,
            loadTemplate:loadTemplate,
            addProduct:addProduct
        };
    };

    /**
    *   productObj holds the data we display in the dom of what a product is
    **/
    var productObj = function(product, i) {
        var self          = this;
        self.photo        = product.photos.medium_half;
        self.title        = product.name;
        self.tagline      = product.tagline;
        self.url          = product.url;
        self.htmlview     = "";
        self.index        = i;
        self.description  = product.description;

        // updates the products html given a template
        var updateHtml= function(template){
            self.htmlview = template.replace('{image}', self.photo)
                          .replace('{title}', self.title)
                          .replace('{tagline}', self.tagline)
                          .replace('{url}', self.url)
                          .replace('{prod_description}', self.description);
        };

        // returns the html for this product
        var getHtmlView = function(){
            return self.htmlview;
        };

        return {
            updateHtml: updateHtml,
            getHtmlView: getHtmlView
        };
    };


    /**
    *   init function that gets all the templates and the data needed to display the page
    **/
    var init = function () {
        //init a new domObj
        page = new domObj();
        // get templates first since we need them when we are processing
        // the product data
        page.loadTemplate('product-template.html').then(function() {
            // then get data from json
            // -----
            // Note: in the original js we where processing the data, then getting the
            // template and then finally updating the html. It made more sense to me
            // to process the product html as we are ingesting the data from the
            // the json
            //-----
            $.getJSON('data.json', function(response){
                // as we parse the json, create a new productObj
               for(var i=0; i<response.sales.length ; i++){
                 var product = new productObj(response.sales[i], i);
                 // then update the html with the given template as the
                 // product data is parsed
                 product.updateHtml(page.getTemplate());
                 // then add the product list
                 page.addProduct(product);
               }
           }).then(function() {
               //update the dom to show our processed products doms
               page.updateDom();
               // wait for all the images to load before
               loadImg();
           });
        });
        //get data
    };

    var removeProduct = function(product) {
        // remove the whole product from the list
        var selectedProduct = $(product).parent().parent();
        selectedProduct.fadeOut(400, function() {
            $(this).remove();
        });
    };


    /**
    *   helper function to check if all the product images have loaded and
    *   then display the page and hide the spinner
    **/
    var loadImg = function() {
        //grab all the images in the page
        var $images = $('#content img');
        var loaded_images_count = 0;

        // when the image is loaded
        $images.load(function(){
            loaded_images_count++;

            // once all the images are loaded, display the page
            if (loaded_images_count == $images.length) {
                // hide the spinner, show the page
                $("#content").removeClass("hidden");
                $("#spinner").addClass("hidden");
            }
        });

        // fail-safe if we load the page with no data so the spinner
        // isnt spinning on the page forever
        if($images.length === 0) {
            $("#content").removeClass("hidden");
            $("#spinner").addClass("hidden");
        }
    };

    return {
        init: init,
        removeProduct:removeProduct
    };
})();

$(document).ready(function() {
    // init here
    productModule.init();
});
