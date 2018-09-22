// Global bootbox
$(document).ready(function() {
    // Getting a reference to the article container div we will render our articles to 
    var articleContainer = $(".article-container");
    // Adding event listeners for dynamically generated buttons for deleting articles,
    // getting, saving, and deleting article notes
    $(document).on("click", ".btn.delete", handleArticleDelete);
    $(document).on("click", ".btn.notes", handleArticleNotes);
    $(document).on("click", ".btn.save", handleNoteSave);
    $(document).on("click", ".btn.note-delete", handleNoteDelete);
    // Getting the party started when loading the page!
    initPage();
  
    function initPage() {
        // Empty the article container, run AJAX request for any saved articles
      articleContainer.empty();
      $.get("/api/headlines?saved=true").then(function(data) {
          // If any headlines, render to the page
        if (data && data.length) {
          renderArticles(data);
        }
        else {
            // Otherwise render a page that explains we have no articles
          renderEmpty();
        }
      });
    }
  
    function renderArticles(articles) {
        // This handles appending HTML containing article data to the page
        // Passing in a JSON array containing all available articles in our database
      var articlePanels = [];
      // Pass each article JSON object to the createPanel function which returns a bootstrap panel
      // with article data inside
      for (var i = 0; i < articles.length; i++) {
        articlePanels.push(createPanel(articles[i]));
      }
      // Once we have HTML for stored articles(in our articlePanels array) append them to articlePanels container
      articleContainer.append(articlePanels);
    }
  
    function createPanel(article) {
        // This function takes in a single JSON object for an article/headline
        // It constructs a jQuery element containing all the formatted HTML for the article panel
      var panel = $(
        [
          "<div class='panel panel-default'>",
          "<div class='panel-heading'>",
          "<h3>",
          "<a class='article-link' target='_blank' href='" + article.url + "'>",
          article.headline,
          "</a>",
          "<a class='btn btn-danger delete'>",
          "Delete From Saved",
          "</a>",
          "<a class='btn btn-info notes'>Article Notes</a>",
          "</h3>",
          "</div>",
          "<div class='panel-body'>",
          article.summary,
          "</div>",
          "</div>"
        ].join("")
        // Attach the articles id to the jQuery element
        // Use this info to fugure out which article the user wantes to remove/open notes for
      );
      panel.data("_id", article._id);
      // Return the constructed panel jQuery element
      return panel;
    }
  
    function renderEmpty() {
        // This func. renders some HTML to the page explaining we don't have any articles to view
        // Using a joined array of HTML string data because it's easier to read/change than a concatenated string!
      var emptyAlert = $(
        [
          "<div class='alert alert-warning text-center'>",
          "<h4>Uh Oh. Looks like we don't have any saved articles.</h4>",
          "</div>",
          "<div class='panel panel-default'>",
          "<div class='panel-heading text-center'>",
          "<h3>Would You Like to Browse Available Articles?</h3>",
          "</div>",
          "<div class='panel-body text-center'>",
          "<h4><a href='/'>Browse Articles</a></h4>",
          "</div>",
          "</div>"
        ].join("")
      );
      // appending data to the page
      articleContainer.append(emptyAlert);
    }
  
    function renderNotesList(data) {
        // This function handles rendering note list items to our notes modal
        // setting up an array of notes to render after finished
        // And setting up a currentNote variable to temporarily store each note
      var notesToRender = [];
      var currentNote;
      if (!data.notes.length) {
          // if we don't have any notes, display a message explaining this
        currentNote = ["<li class='list-group-item'>", "No notes for this article yet.", "</li>"].join("");
        notesToRender.push(currentNote);
      }
      else {
        for (var i = 0; i < data.notes.length; i++) {
          currentNote = $(
            [
              "<li class='list-group-item note'>",
              data.notes[i].noteText,
              "<button class='btn btn-danger note-delete'>x</button>",
              "</li>"
            ].join("")
          );
          currentNote.children("button").data("_id", data.notes[i]._id);
          notesToRender.push(currentNote);
        }
      }
      $(".note-container").append(notesToRender);
    }
  
    function handleArticleDelete() {
        // This function handles deleting article 
      var articleToDelete = $(this).parents(".panel").data();
      $.ajax({
        method: "DELETE",
        url: "/api/headlines/" + articleToDelete._id
      }).then(function(data) {
        if (data.ok) {
          initPage();
        }
      });
    }
  
    function handleArticleNotes() {
      var currentArticle = $(this).parents(".panel").data();
      $.get("/api/notes/" + currentArticle._id).then(function(data) {
        var modalText = [
          "<div class='container-fluid text-center'>",
          "<h4>Notes For Article: ",
          currentArticle._id,
          "</h4>",
          "<hr />",
          "<ul class='list-group note-container'>",
          "</ul>",
          "<textarea placeholder='New Note' rows='4' cols='60'></textarea>",
          "<button class='btn btn-success save'>Save Note</button>",
          "</div>"
        ].join("");
        bootbox.dialog({
          message: modalText,
          closeButton: true
        });
        var noteData = {
          _id: currentArticle._id,
          notes: data || []
        };
        $(".btn.save").data("article", noteData);
        renderNotesList(noteData);
      });
    }
  
    function handleNoteSave() {
      var noteData;
      var newNote = $(".bootbox-body textarea").val().trim();
      if (newNote) {
        noteData = {
          _id: $(this).data("article")._id,
          noteText: newNote
        };
        $.post("/api/notes", noteData).then(function() {
          bootbox.hideAll();
        });
      }
    }
  
    function handleNoteDelete() {
      var noteToDelete = $(this).data("_id");
      $.ajax({
        url: "/api/notes/" + noteToDelete,
        method: "DELETE"
      }).then(function() {
        bootbox.hideAll();
      });
    }
  });