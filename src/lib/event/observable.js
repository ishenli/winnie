/**
 * @file observable
 * @author ishenli <meshenli@gmail.com>
 */
define(function () {

    /**
     * 存储Observer
     * @type Object
     */
    var entryList = {};

    /**
     * 遍历register对象并获取entry
     * @param {HTMLElement}element
     * @param {string} type
     * @param {Function} original
     * @param {Function} handler
     * @param {boolean} root 是否是rootListener
     * @param {Function} fn
     */
    function forAll(element, type, original, handler, root, fn) {
        var prefix = root ? 'r' : '$';
        if (!type || type === '*') {
            for (var key in entryList) {
                if (key.charAt(0) === prefix) {
                    forAll(element, key.substr(1), original, handler, root, fn);
                }
            }
        }
        else {
            var i = 0, l, list = entryList[prefix + type];
            if (!list) {
                return;
            }

            for (l = list.length; i < l; i++) {
                if (list[i].matches(element, original, handler)
                    && !fn(list[i], list, i, type)
                ) {
                    return;
                }
            }
        }
    }

    function has(element, type, original, root) {
        var i, list = entryList[(root ? 'r' : '$') + type];
        if (list) {
            for (i = list.length; i--;) {
                if (!list[i].root
                    && list[i].matches(element, original, null)
                ) {
                    return true;
                }
            }
        }
        return false;
    }

    function put(entry) {
        var has = !entry.root && !this.has(entry.element, entry.type, null, false);
        var key = (entry.root ? 'r' : '$') + entry.type; // click||customType
        (entryList[key] || (entryList[key] = [])).push(entry);
        return has;
    }

    /**
     * 获取某个的元素的事件集合
     * @param {HTMLElement} element
     * @param {string} type
     * @param {Function} original
     * @param {boolean} root
     */
    function get(element, type, original, root) {
        var entries = [];

        forAll(element, type, original, null, root, function (entry) {
            return entries.push(entry);
        });

        return entries;
    }

    function del(entry) {
        forAll(entry.element, entry.type, null, entry.handler, entry.root, function (entry, list, i) {
            list.splice(i, 1);
            entry.removed = true;
            if (list.length === 0) {
                delete entryList[(entry.root ? 'r' : '$') + entry.type];
            }
            return false;
        });
    }

    function entries() {

    }

    return {
        has: has,
        get: get,
        put: put,
        del: del,
        entries: entries
    };
});
