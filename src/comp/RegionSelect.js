/**
 *
 * @overview
 * @author amoschen
 * @create 14-6-6
 */
LBF.define('qidian.comp.RegionSelect', function (require, exports, module) {
    var Node = require('ui.Nodes.Node'),
        ComboBox = require('qidian.comp.ComboBox'),
    //ComboBox = require('ui.widget.ComboBox.ComboBox'),
        RegionDB = require('util.region'),
        each = require('lang.each'),
        $ = require('lib.jQuery'),
        logger = require('qidian.comp.logger'),
        isArray = require('lang.isArray');

    var REGION_LEVEL_MAP = ['nation', 'province', 'city', 'district'],
    //REGION_LEVEL_MAP = ['nation', 'province', 'city'],
        REGION_LEVEL_DEF_OPTION = [{
            name: '不限国家',
            key: -1
        }, {
            name: '不限省份',
            key: -2
        }, {
            name: '不限城市',
            key: -3
        }, {
            name: '不限区县',
            key: -4
        }
        ],
    //maxdisplay = 8,//最大显示个数
        LEVEL_NATION = 0;


    module.exports = exports = Node.inherit({
        events: {
            'unload': 'removeComponents'
        },

        render: function () {
            var regionSelect = this,
                selector = this.get('selector'),
                container = this.get('container'),
                maxdisplay = this.get('maxdisplay'),//最大显示个数
                comboboxArr = this.comboboxArr = [],
                selectTitle = this.get('selectTitle'),
                hideDistrict = this.get('hideDistrict') || true,//默认不使用地区选择功能
                $select, disableLevel = 5;

            if (!selector || ($select = $(selector)).length === 0) {
                // todo
                // container mode
            }
            if (hideDistrict) {
                disableLevel = 4;
            }
            if (selectTitle) {
                REGION_LEVEL_DEF_OPTION = selectTitle;
            }
            if (!maxdisplay) {
                maxdisplay = 10;//如果没初始化，那就为10个
            }
            // init comboboxes
            $select.each(function (i) {
                var combobox = new ComboBox({
                    selector: this,
                    maxDisplay: maxdisplay
                });

                comboboxArr.push(combobox);

                combobox
                    .bind('select', function (event, regionKey) {
                        var selected = RegionDB.get(regionKey);
                        // console.log(selected);
                        if (selected != null) {
                            regionSelect.set(REGION_LEVEL_MAP[i], selected);
                        } else {
                            regionSelect.set(REGION_LEVEL_MAP[i], {key: "", level: (i), name: "请选择", code: -2});
                        }


                    })
                    .bind('select', function (event, regionKey) {
                        // hide all lower level combobox
                        combobox.nextAll('.region-combobox').addClass('hidden');

                        try {
                            var nextLevel = RegionDB.nextLevel(regionKey);
                            // no next level
                            //!!!!!
                            //no need to show district level, so added level == 4 here
                            if (!nextLevel || nextLevel.level == disableLevel) {
                                return;
                            }

                            // ajust level, remove global level
                            nextLevel = nextLevel.level - 1;

                            // get region list & transform to option list
                            var list = RegionDB.getList(regionKey),
                                options = regionSelect.adaptorRegion2Options(nextLevel, list);
                            // reset next level combobox options
                            var nextLvCombobox = comboboxArr[nextLevel];
                            nextLvCombobox
                                .reset(options)
                                .removeClass('hidden');
                        } catch (e) {
                            return;
                        }


                    })
                    .bind('reset', function () {
                        // update options to region select
                        regionSelect.set(REGION_LEVEL_MAP[i] + 'Options', combobox.get('options'));
                    });
            });

            // init region
            this.selectRegion(regionSelect.get('region'));
        },

        /**
         * Set region by code
         * @method selectRegion
         * @param {Object} region Region codes to be selected
         * @param {String} [region.nation] Code of nation to be selected
         * @param {String} [region.province] Code of province to be selected
         * @param {String} [region.city] Code of city to be selected
         * @param {String} [region.district] Code of district to be selected
         * @chainable
         */
        selectRegion: function (region) {
            var regionSelect = this,
                comboboxArr = this.comboboxArr,
                nationList = RegionDB.getList(),
                nationOptions = this.adaptorRegion2Options(LEVEL_NATION, nationList);

            // init with nation list
            comboboxArr[LEVEL_NATION].reset(nationOptions);

            // fast exit when no nation selected
            // nation is not optional
            if (!region.nation) {
                return this;
            }

            // set each region
            each(REGION_LEVEL_MAP, function (i, lvName) {
                var code = region[lvName];

                // some region level may not exist, mostly province & district
                if (!code) {
                    return;
                }

                var combobox = comboboxArr[i],
                    idx = -1,
                    options;

                // get region info by code
                if (options = regionSelect.get(lvName + 'Options')) {
                    each(options, function (i, option) {
                        var key = option.value,
                            region = RegionDB.get(key);

                        if (region && region.code === code) {
                            idx = i;
                            return false;
                        }
                    });
                }

                if (idx === -1) {
                    // when illegal region
                    logger.warn('[region select][set region] illegal region code ' + code + ' at level ' + lvName);
                    // console.warn('[region select][set region] illegal region code ' + code + ' at level ' + lvName);

                    // stop setting to prevent further error
                    return false;
                }

                combobox.select(idx);
            });
        },

        /**
         * Disable region select based on the arguments
         * @disableProvinceAndCity
         * e.g: disable all the four region selects:
         * option: {
         *       nation: true,
         *       province: true,
         *       city: true,
         *       district: true
         *   }
         */
        disableRegions: function (options) {
            var comboboxArr = this.comboboxArr;
            options.nation && comboboxArr[0] ? comboboxArr[0].disable() : '';//nation
            options.province && comboboxArr[1] ? comboboxArr[1].disable() : '';//province
            options.city && comboboxArr[2] ? comboboxArr[2].disable() : '';//city
            options.district && comboboxArr[3] ? comboboxArr[3].disable() : '';//district
        },

        /**
         * Get selected region info
         * @method getSelectedRegion
         * @return {Object} region
         *      @param {Object} nation Nation info
         *          @param {String} name
         *          @param {String} code
         *      @param {Object} province Province info
         *          @param {String} name
         *          @param {String} code
         *      @param {Object} city City info, same sub format as nation
         *          @param {String} name
         *          @param {String} code
         *      @param {Object} district District info, same sub format as nation
         *          @param {String} name
         *          @param {String} code
         */
        getSelectedRegion: function () {
            var regionSelect = this,
                region = {},
                comboboxArr = this.comboboxArr;

            each(REGION_LEVEL_MAP, function (i, lvName) {
                region[lvName] = comboboxArr[i] && !comboboxArr[i].is(':hidden') ? regionSelect.get(lvName) : null;
            });

            return region;
        },

        adaptorRegion2Options: function (level, list) {
            // add default option
            list.unshift(REGION_LEVEL_DEF_OPTION[level]);
            // transform regions to combobox options
            return this.format(list);
        },

        /**
         * remove the comboboxArr to avoid memory leak
         */
        removeComponents: function () {
            each(this.comboboxArr, function (index, combobox) {
                combobox.remove();
            });

            this.comboboxArr = [];
        },

        format: function (region) {
            if (!isArray(region)) {
                return {
                    text: region.name,
                    // in case of typeof region.key === 'undefined'
                    value: region.key || ''
                };
            }

            var options = [];
            each(region, function (i, orig) {
                options.push({
                    text: orig.name,
                    // in case of typeof region.key === 'undefined'
                    value: orig.key || ''
                });
            });

            return options;
        }
    });

    // default properties to be merged from constructor options
    exports.settings = {
        region: null
    };

    var getRegionByCode = exports.getRegionByCode = function (region) {
        var args = [],
            ret = {},
            retArr;

        each(REGION_LEVEL_MAP, function (i, lvName) {
            args.push(region[lvName] || null);
        });

        retArr = RegionDB.queryByCode.apply(RegionDB, args);

        each(REGION_LEVEL_MAP, function (i, lvName) {
            ret[lvName] = retArr[i];
        });

        return ret;
    };

    /**
     * %nation %province %city %district
     * @param region
     * @param {String} format Format region name, with format args %nation %province %city %district
     */
    exports.getRegionStringByCode = function (region, format) {
        var ret = getRegionByCode(region);

        each(REGION_LEVEL_MAP, function (i, lvName) {

        });
    };
});