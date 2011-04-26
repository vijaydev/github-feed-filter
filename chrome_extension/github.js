(function (a) {
    a.fn.repoList = function (d) {
        var b = a.extend({}, a.fn.repoList.defaults, d);
        return this.each(function () {
            var c = a(this),
                f = c.find(".repo_list"),
                e = c.find(".show-more"),
                g = c.find(".filter_input").val(""),
                h = g.val(),
                j = e.length == 0 ? true : false,
                l = null,
                k = false;
            g[0] && typeof g[0].onsearch == "object" && g.addClass("native");
            e.click(function () {
                if (k) return false;
                var s = e.spin();
                k = true;
                a(b.selector).load(b.ajaxUrl, function () {
                    j = true;
                    s.parents(".repos").find(".filter_selected").click();
                    s.stopSpin()
                });
                s.hide();
                return false
            });

            function m() {
                var s = f.find("li");
                if (l) {
                    s.hide();
                    f.find("li." + l).show()
                } else s.show();
                g.val() != "" && s.filter(":not(:Contains('" + g.val() + "'))").hide()
            }
            c.find(".repo_filter").click(function () {
                var s = a(this);
                c.find(".repo_filterer a").removeClass("filter_selected");
                s.addClass("filter_selected");
                l = s.attr("rel");
                j ? m() : e.click();
                return false
            });
            var n = "placeholder" in document.createElement("input");

            function q() {
                n || (g.val() == "" ? g.addClass("placeholder") : g.removeClass("placeholder"))
            }
            g.bind("keyup blur click", function () {
                if (this.value != h) {
                    h = this.value;
                    j ? m() : e.click();
                    q()
                }
            });
            q()
        })
    };
    a.fn.repoList.defaults = {
        selector: "#repo_listing",
        ajaxUrl: "/dashboard/ajax_your_repos"
    }
})(jQuery);
