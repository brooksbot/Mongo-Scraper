$(document).ready(function() {
    // Setting a reference to the article-container div where all the dynamic content will go
    // Adding event listeners to any dynamically generated "save article" and "scrape new article" buttons
  var articleContainer = $(".article-container");
  $(document).on("click", ".btn.save", handleArticleSave);
  $(document).on("click", ".scrape-new", handleArticleScrape);
    // Once the page is ready, run the initPage function to start
  initPage();

  function initPage() {
      // Empty the article container, run an AJAX request for any unsaved headlines
        articleContainer.empty();
        $.get("/api/headlines?saved=false")
          .then(function(data) {
        // if we have headlines, render them to the page
      if (data && data.length) {
        renderArticles(data);
      } else {
          // otherwise render a message explaining we have to articles
        renderEmpty();
      }
     });
  }

  function renderArticles(articles) {
      // This function handles appending/attaching HTML(containing our article data) to the page
      // It passed an array of JSON data containing all available articles in our database
    var articlePanels = [];
    // Pass each article JSON object to the createPanel function which returns a boostrap panel
    // with our article data inside
    for (var i = 0; i < articles.length; i++) {
      articlePanels.push(createPanel(articles[i]));
    }
    // Once we have all the HTML for the articles stored in our articlePanels array, 
    // append them to the articlePanel container
    articleContainer.append(articlePanels);
  }

  function createPanel(article) {
    // This function takes in a single JSON object for an article/headline and constructs
    // a jQuery element containing all of the fomatted HTML for the article panel
    var panel = $(
      [
        "<div class='panel panel-default'>",
        "<div class='panel-heading'>",
        "<h4>",
        "<a class='article-link' target='_blank' href='" + article.url + "'>",
        article.headline,
        "</a>",
        "<a class='btn btn-success save'>",
        "Save Article",
        "</a>",
        "</h4>",
        "</div>",
        "<div class='panel-body'>",
        article.summary,
        "</div>",
        "</div>"
      ].join("")
      // Attach the article's id to the jQuery element
      // We'll use this when trying to figure out which article the user wants to save
    );
    panel.data("_id", article._id);
    // Return the constucted  panel jQuery element
    return panel;
  }

  function renderEmpty() {
    var emptyAlert = $(
      [
        "<div class='alert alert-warning text-center'>",
        "<h4>Uh Oh. Looks like we don't have any new articles.</h4>",
        "</div>",
        "<div class='panel panel-default'>",
        "<div class='panel-heading text-center'>",
        "<h3>What Would You Like To Do?</h3>",
        "</div>",
        "<div class='panel-body text-center'>",
        "<h4><a class='scrape-new'>Try Scraping New Articles</a></h4>",
        "<h4><a href='/saved'>Go to Saved Articles</a></h4>",
        "</div>",
        "</div>"
      ].join("")
    );
    articleContainer.append(emptyAlert);
  }

  function handleArticleSave() {
    var articleToSave = $(this)
      .parents(".panel")
      .data();
    articleToSave.saved = true;
    $.ajax({
      method: "PUT",
      url: "/api/headlines/" + articleToSave._id,
      data: articleToSave
    }).then(function(data) {
      if (data.saved) {
        initPage();
      }
    });
  }

  function handleArticleScrape() {
    $.get("/api/fetch").then(function(data) {
      initPage();
      bootbox.alert("<h3 class='text-center m-top-80'>" + data.message + "<h3>");
    });
  }
});
