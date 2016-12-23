document.addEventListener('DOMContentLoaded', () => {

  function getTypeOptions(type) {
    var options = {};

    var color = '#AEAEAE';

    switch (type) {
      case 'package':
        options.color = '#DA5656';
        options.icon = ['mdi', 'mdi-folder'];
        break;

      case 'file':
        options.color = '#5978DF';
        options.icon = ['mdi', 'mdi-file'];
        break;

      case 'project':
        options.color = '#76D671';
        options.icon = ['mdi', 'mdi-android'];
        break;

      default:
        options.color = '#AEAEAE';
        options.icon = ['mdi', 'mdi-key'];
        break;
    }

    return options;
  };

  function processEntries(project) {
    var json = {};

    var rng = ((ts) => {
      var numbers = ts.toString().split('');

      var rng = '';

      for (var i = 0; i < 8; i++) {
        rng += numbers[parseInt(Math.random() * (numbers.length - 1))]
      }

      return rng;
    })(+new Date);

    var typeOptions = getTypeOptions(project['type']);

    json['id'] =
      project['name'].toLowerCase() + '-' +
      project['type'].toLowerCase() + '-' +
      rng;

    json['data'] = {};

    json['data']['$color'] = typeOptions.color;
    json['data']['type'] = project['type'];

    for (var i in project) {
      if (typeof project[i] !== 'object')
        json[i] = project[i];
    }

    if ('files' in project) {
      json['children'] = [];

      for (var i = 0; i < project['files'].length; ++i) {
        if (Object.keys(project['files'][i]).length == 0) continue;

        json['children'].push(processEntries(project['files'][i]));
      }

      // json['children'].sort((a,b) => {
      //   return (a.type == 'package' ? -1 : 1);
      // });
    }

    return json;
  };

  var project = {
    "name": "CodeVis",
    "type": "project",
    "files": [{
      "name": "controllers",
      "type": "package",
      "files": []
    }, {
      "name": "Main.java",
      "type": "file"
    }, {
      "name": "layout",
      "type": "package",
      "files": [{
        "name": "UIMain.java",
        "type": "file"
      }, {
        "name": "UIUser.java",
        "type": "file"
      }, {
        "name": "admin",
        "type": "package",
        "files": [{
          "name": "UIAdmin.java",
          "type": "file"
        }, {
          "name": "UIMain.java",
          "type": "file"
        }, {
          "name": "UIDashboard.java",
          "type": "file"
        }, {
          "name": "UIPermission.java",
          "type": "file"
        }, {
          "name": "UIMessages.java",
          "type": "file"
        }]
      }, {
        "name": "UICar.java",
        "type": "file"
      }, {
        "name": "UIRent.java",
        "type": "file"
      }]
    }]
  };

  function createIcon(iconType) {
    var icon = document.createElement('i');

    icon.classList.add.apply(icon.classList, iconType);

    return icon;
  }

  function createInfo() {
    return document.createElement('span');
  }

  function createDiv() {
    return document.createElement('div');
  }

  function generateTree(project) {
    var typeOptions = getTypeOptions(project['type']);
    var icon = createIcon(typeOptions.icon);
    var arrow = createIcon(['mdi', 'mdi-menu-right']);

    var info = createInfo();
    info.textContent = project['name'];
    info.classList.add(project['type'], 'info');

    info.addEventListener('click', function(e) {
      if (this.classList.contains('package') || this.classList.contains('project')) {
        this.classList.toggle('open');
        e.stopPropagation();
      }
    });

    info.insertAdjacentElement('afterbegin', icon);
    info.insertAdjacentElement('afterbegin', arrow);

    var subtree = createDiv();

    if ('files' in project) {
      subtree = generateTree2(project['files']);
    }

    var div = createDiv();
    div.classList.add('project');
    div.appendChild(info);
    div.appendChild(subtree);
    return div;
  }

  function generateTree2(files) {
    files.sort((a, b) => {
      return (a.type == 'package' ? -1 : 1);
    });

    var div = createDiv();
    div.classList.add('subtree');

    for (var i = 0; i < files.length; ++i) {
      var typeOptions = getTypeOptions(files[i]['type']);
      var icon = createIcon(typeOptions.icon);
      var arrow = createIcon(['mdi', 'mdi-menu-right']);

      var info = createInfo();
      info.textContent = files[i]['name'];
      info.classList.add(files[i]['type'], 'info');

      info.addEventListener('click', function(e) {
        if (this.classList.contains('package') || this.classList.contains('project')) {
          this.classList.toggle('open');
          e.stopPropagation();
        }
      });

      info.insertAdjacentElement('afterbegin', icon);

      if (files[i]['type'] != 'file')
        info.insertAdjacentElement('afterbegin', arrow);

      div.appendChild(info);

      if ('files' in files[i])
        div.appendChild(generateTree2(files[i]['files']));
    }

    return div;
  }

  var tree = generateTree(project);
  console.log(tree);
  document.getElementById('project-tree').appendChild(tree);

  CodeMirror.runMode(
    JSON.stringify(project, null, 2),
    'application/json',
    document.getElementById('pre-json')
  );

  var json = processEntries(project);
  CodeMirror.runMode(
    JSON.stringify(json, null, 2),
    'application/json',
    document.getElementById('pos-json')
  );

  var icicle = new $jit.Icicle({
    injectInto: 'graph-icicle',
    constrained: true,
    levelsToShow: 3,
    offset: 2,
    animate: true,
    Events: {
      enable: true,
      onClick: (node) => {
        console.log(node.id);
        if (node) {
          icicle.enter(node);
        }
      },
      onRightClick: () => {
        console.log('out');
        icicle.out();
      }
    }
  });

  icicle.loadJSON(json);
  icicle.refresh();

  var rgraph = new $jit.RGraph({
    injectInto: 'graph-rgraph',
    background: {
      CanvasStyles: {
        strokeStyle: '#555'
      }
    },
    Navigation: {
      enable: true,
      panning: true,
      zooming: 10
    },
    Node: {
      color: '#ddeeff',
      overridable: true
    },
    Edge: {
      color: '#c17878',
      lineWidth: 1.5
    },

    onBeforeCompute: (node) => {

    },
    onCreateLabel: (domElement, node) => {
      domElement.innerHTML = node.name;
      domElement.onclick = function(){
        rgraph.onClick(node.id, {
          onComplete: function() {

          }
        });
      };
    },
    onPlaceLabel: (domElement, node) => {
      var style = domElement.style;

      style.display = '';
      style.cursor = 'pointer';

      if (node._depth <= 1) {
        style.fontSize = "0.8em";
        style.color = "#ccc";
      }
      else if(node._depth == 2){
        style.fontSize = "0.7em";
        style.color = "#494949";
      }
      else {
        style.display = 'none';
      }

      var left = parseInt(style.left);
      var w = domElement.offsetWidth;
      style.left = (left - w / 2) + 'px';
    }
  });

  rgraph.loadJSON(json);
  rgraph.graph.eachNode(function(n) {
    var pos = n.getPos();
    pos.setc(-200, -200);
    console.log(n);

    n.data.$dim = 10;

    switch (n.data.type) {
      case 'project':
        n.data.$type = 'square';
        break;
      case 'package':
        n.data.$type = 'circle';
        break;
      case 'file':
        n.data.$type = 'star';
        break;
      default:
        n.data.$type = 'triangle';
        break;
    }
  });
  rgraph.compute('end');
  rgraph.fx.animate({
    modes: ['polar'],
    duration: 2000
  });


});
