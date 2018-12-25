## Framework

This project uses:
  * NodeJS as a runtime environment
  * ExpressJS as a server framework
  * EJS as a templating engine

## Project tree

### Note:
To learn more about writing codes for the MVC components, visit [this link](https://code.tutsplus.com/tutorials/build-a-complete-mvc-website-with-expressjs--net-34168?fbclid=IwAR3JxuCDkJWAZjWK3Mba2VglRyBZ-VJ3_wAlzbQ9kC8VO-Rv4wUPHbjFhj8)

### project
  * .vscode
    - (config files.)
  * node_modules 
    - (This folder stores nodejs' dependencies.)
  * controllers
    - (This folder stores .js files for the controllers of our MVC architecture.)
  * models
    - (This folder stores .js files for the models of our MVC architecture.)
  * views (this folder stores files for the views of our MVC architecture, mostly .ejs files.)
    - pages
      + (These are the complete pages that will be served to clients)
    - partials
      + (These are the components that will be reused multiple times in different pages. You can include a component into a page with EJS' <%- include %> method.)
  * public
    - css
      + (These are the stylesheets that will be used to make our pages look however we want them to.)
    - fonts
      + (These are the fonts that will be used in our site. Note: font-awesome is used to display various icon-like characters.)
    - images
      + (These are the images that will be served to our clients.)
    - js
      + (These are the external scripts that we imported from other sources (libraries and dependencies).)
    - vendors
      + (These are the extra components that we imported.)
  * routes
    - (These are the .js files that will handle our site's routing. E.g. 'index.js' will handle the '/' endpoint.)
  * package.json (This file stores the information about this project's information, most importantly its dependencies, so that npm install will know which package to install.)
  * server.js
    - (This is the entry point of our website, i.e. the file that will run when we start our server.)