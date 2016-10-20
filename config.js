module.exports = {
    "local": {
        "isLocal": true,
        "domain": "local.school.express.com:3000",
        "sslDomain": "local.school.express.com:3000",
        "mobileDomain": "local.school.express.com:3000",
        "base": "",

        "badjs": "//dev.gtimg.com/lbf/0.8.5/lib/badjs.js",
        "lbfSrc": "//local.school.express.com:3000/static_proxy/lib/LBF/src/LBF.js",
        "lbfConf": {
            "paths": {
                "qidian": "//local.school.express.com:3000/static_proxy"
            },
            "vars": {
                "theme": "//local.school.express.com:3000/static_proxy/themes/default",
                "qidianTheme": "//local.school.express.com:3000/static_proxy/themes/blue"
            },
            "alias": {
                "ueditor": "//local.school.express.com:3000/static_proxy/sites/comp/ueditor.all",
                "ueditorConfig": "//local.school.express.com:3000/static_proxy/sites/comp/ueditor.config",
                "ueditorParse": "//local.school.express.com:3000/static_proxy/sites/comp/ueditor.parse",
                "zeroCopy": "//local.school.express.com:3000/static_proxy/sites/comp/third-party/zeroclipboard/ZeroClipboard.min"
            },
            "env": "local",
            "combo": false,
            "debug": false
        }
    },

    "development": {
        "domain": "dev.gtimg.com",
        "sslDomain": "dev.gtimg.com",
        "mobileDomain": "dev.gtimg.com",
        "badjs": "//dev.gtimg.com/lbf/0.8.5/lib/badjs.js",
        "lbfSrc": "//dev.gtimg.com/lbf/0.8.5/LBF.js",
        "lbfConf": {
            "paths": {
                "qidian": "//dev.gtimg.com/qidian_branch_e/src"
            },
            "vars": {
                "theme": "//dev.gtimg.com/qidian_branch_e/src/themes/default",
                "qidianTheme": "//dev.gtimg.com/qidian_branch_e/src/themes/blue"
            },
            "alias": {
                "ueditor": "//dev.gtimg.com/qidian_branch_e/src/sites/comp/ueditor.all",
                "ueditorConfig": "//dev.gtimg.com/qidian_branch_e/src/sites/comp/ueditor.config",
                "ueditorParse": "//dev.gtimg.com/qidian_branch_e/src/sites/comp/ueditor.parse",
                "zeroCopy": "//dev.gtimg.com/qidian_branch_e/src/sites/comp/third-party/zeroclipboard/ZeroClipboard.min"
            },
            "env": "development",
            "combo": false,
            "debug": false
        },

        "minify": {
            "removeComments": true,
            "collapseWhitespace": false,
            "minifyJS": true,
            "minifyCSS": true
        }
    },

    "test": {
        "domain": "oa.gtimg.com",
        "sslDomain": "oa.gtimg.com",
        "mobileDomain": "oa.gtimg.com",
        "badjs": "//oa.gtimg.com/lbf/0.8.5/lib/badjs.js",
        "lbfSrc": "//oa.gtimg.com/lbf/0.8.5/LBF.js",
        "lbfConf": {
            "paths": {
                "qidian": "//oa.gtimg.com/qidian_branch_e/src"
            },
            "vars": {
                "theme": "//oa.gtimg.com/qidian_branch_e/src/themes/default",
                "qidianTheme": "//oa.gtimg.com/qidian_branch_e/src/themes/blue"
            },
            "alias": {
                "ueditor": "//oa.gtimg.com/qidian_branch_e/src/sites/comp/ueditor.all",
                "ueditorConfig": "//oa.gtimg.com/qidian_branch_e/src/sites/comp/ueditor.config",
                "ueditorParse": "//oa.gtimg.com/qidian_branch_e/src/sites/comp/ueditor.parse",
                "zeroCopy": "//oa.gtimg.com/qidian_branch_e/src/sites/comp/third-party/zeroclipboard/ZeroClipboard.min"
            },
            "env": "test"
        },
        "minify": {
            "removeComments": true,
            "collapseWhitespace": false,
            "minifyJS": true,
            "minifyCSS": true
        }
    },

    "production": {
        "statReport": true,
        "minify": {
            "removeComments": true,
            "collapseWhitespace": false,
            "minifyJS": true,
            "minifyCSS": true
        }
    },

    "common": {
        "domain": "bqq.gtimg.com",
        "sslDomain": "bqq.gtimg.com",
        "mobileDomain": "bqq.gtimg.com",
        "base": "/qidian_branch_e/src",
        "mobileBase": "/qidianmobile/branch_e/src",
        "statReport": false,

        "badjs": "//bqq.gtimg.com/lbf/0.8.5/lib/badjs.js",
        "lbfSrc": "//bqq.gtimg.com/lbf/0.8.5/LBF.js",
        "lbfConf": {
            "comboSuffix": "?v=201662",
            "paths": {
                "qidian": "//bqq.gtimg.com/qidian_branch_e/src"
            },
            "vars": {
                "theme": "//bqq.gtimg.com/qidian_branch_e/src/themes/default",
                "qidianTheme": "//bqq.gtimg.com/qidian_branch_e/src/themes/blue"
            },
            "alias": { 
                "ueditor": "//bqq.gtimg.com/qidian_branch_e/src/sites/comp/ueditor.all",
                "ueditorConfig": "//bqq.gtimg.com/qidian_branch_e/src/sites/comp/ueditor.config",
                "ueditorParse": "//bqq.gtimg.com/qidian_branch_e/src/sites/comp/ueditor.parse",
                "zeroCopy": "//bqq.gtimg.com/qidian_branch_e/src/sites/comp/third-party/zeroclipboard/ZeroClipboard.min"
            },
            "env": "production",
            "combo": true
        },

        "ptlogin": {
            "proxy": "/static_proxy/qidian_branch_e/src/comp/login/proxy.html",
            "appID": "1600000279"
        }
    }
}