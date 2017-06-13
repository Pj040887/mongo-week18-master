
getSavedArticles();

function getSavedArticles()
{
  $.getJSON("/articles", function(data) {
    
    for (var i = 0; i < data.length; i++) {
      
      populateArticle(data[i])
    }
  });
}


function populateArticle(value)
{
  let container = $("<div class='article-div'></div>");
  let btnDelete = $("<button class='btn btn-danger del-article' style='margin-left: 15px'>Delete Article</button>");
  let btnNote = $("<button class='btn btn-info add-note'>Add Note</button>")
  btnNote.attr("data-id", value._id);
  btnDelete.attr("data-id", value._id);
  container.append("<p data-id='" + value._id + "'>" + value.title + "<br />");
  container.append("<a href=" + value.link + ">"+value.link+"</a><br />");
  container.append(btnNote);
  container.append(btnDelete);
  container.append("<hr/>");
  $("#saved-articles").append(container);
}

 
$("#btnScrape").on("click", function()
{
  console.log("scraping")
  $.getJSON("/scrape", function(data)
  {
    console.log("got back data" + JSON.stringify(data));
    data.forEach(function(value)
    {
      let submitBtn = $("<button class='btn btn-info save-article'>Save Article</button>");
      submitBtn.attr("data-title", value.title);
      submitBtn.attr("data-link", value.link);
      $("#articles").append("<p>"+value.title+"<br />" + "</p>");
      $("#articles").append("<a href=" + value.link + ">"+value.link+"</a><br />")
      $("#articles").append(submitBtn);
      $("#articles").append("<hr/>");
    });
  });
});

$(document).on("click", "button.save-article", function(event) {
  event.preventDefault();
  var article = {title: $(this).attr("data-title"), link: $(this).attr("data-link")};
  $.post("/articles", article, function(data)
  {
    populateArticle(data);
  })
});


$(document).on("click", "button.del-article", function(event)
{
  console.log("clicked on delete for id: "+ $(this).attr("data-id"));
  event.preventDefault();
  $.get("/articles/delete/"+$(this).attr("data-id"), function(data)
  {
    $("#saved-articles").empty();
    getSavedArticles();
    console.log(data);
  });
})


$(document).on("click", "button.add-note", function(event) {
  event.preventDefault();
  
  $("#notes").empty();
  
  var thisId = $(this).attr("data-id");

  
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    
    .done(function(data) {
      console.log(data);
      
      $("#notes").append("<h2>" + data.title + "</h2>");
      
      $("#notes").append("<input id='titleinput' name='title' >");
    
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      
      if (data.note) {
        
        $("#titleinput").val(data.note.title);
        
        $("#bodyinput").val(data.note.body);
      }
    });
});


$(document).on("click", "#savenote", function() {
  
  var thisId = $(this).attr("data-id");

  
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {

      title: $("#titleinput").val(),
   
      body: $("#bodyinput").val()
    }
  })
    
    .done(function(data) {
      
      console.log(data);
     
      $("#notes").empty();
    });

  $("#titleinput").val("");
  $("#bodyinput").val("");
});

