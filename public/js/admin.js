jQuery(function ($) {
    
  $(".sidebar-dropdown > a").click(function() {
    $(".sidebar-submenu").slideUp(200);
    if (
    $(this)
    .parent()
    .hasClass("active")
    ) {
      $(".sidebar-dropdown").removeClass("active");
      $(this)
      .parent()
      .removeClass("active");
    } else {
      $(".sidebar-dropdown").removeClass("active");
      $(this)
      .next(".sidebar-submenu")
      .slideDown(200);
      $(this)
      .parent()
      .addClass("active");
    }
  });
  
  $("#close-sidebar").click(function() {
    $(".page-wrapper").removeClass("toggled");
  });
  $("#show-sidebar").click(function() {
    $(".page-wrapper").addClass("toggled");
  }); 
});

$(document).ready(function() {
  var readURL = function(input) {
      if (input.files && input.files[0]) {
          var reader = new FileReader();

          reader.onload = function (e) {
              $('.avatar').attr('src', e.target.result);
          }
  
          reader.readAsDataURL(input.files[0]);
      }
  }
  
  $(".file-upload").on('change', function(){
      readURL(this);
  });
});