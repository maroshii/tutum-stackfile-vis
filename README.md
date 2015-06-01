## Stackfile visualisation

The app was bootstrapped with the Yeoman [webapp generator](https://github.com/yeoman/generator-webapp). However, dependencies were embedded to make it easier to run locally.

Dependencies:

- bootstrap *(css)*
- jsyaml
- d3 *(linked externally)*

To run the full project:

```
npm install
grunt serve
```

To avoid installing dependencies a *golang* statis server is provided that points to /app:

    ./static-server

Either way, app should be running on *localhost:8080*

### Notes

The yaml needed to render the tree is expected to have a single root element. `lb` will be used if it exists, otherwise the first entry will be used as the root element.

Any number of links are allowed for any given entry with the caveat that it might not fit in the **svg** (resizing is pending!).
