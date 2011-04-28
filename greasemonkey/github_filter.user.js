// ==UserScript==
// @name           GitHub Feed Filter
// @description    Adds the ability to filter out GitHub feeds based on repositories and specific categories
// @namespace      http://vijaydev.wordpress.com
// @include        https://github.com/
// @include        https://github.com/#
// @include        https://github.com/dashboard
// ==/UserScript==

/* Bugs & TODOS
 * T: Optimize re-runs (next version)
 */

var Ghf = {
	$: unsafeWindow.jQuery, log: unsafeWindow.console.info,
	feeds: {}, counts: {}, ui: {},

	init: function() {
		this.feeds = {};
		this.counts = { 'all': 0, 'commits': 0, 'comments': 0, 'issues': 0 };
		this.ui = { body: [], bottom_bar: "<div class='bottom-bar'> </div> </div>", top_bar: "<div class='repos' id='your_feeds'> <div class='top-bar'> <h2 class='count'>News Feeds <em></em></h2> </div><div class='filter-bar'> <input class='filter_input' placeholder='Find a repository feed…' type='search'><ul class='repo_filterer'> <li class='all_repos'><a href='#' class='repo_filter filter_selected' rel='all'>All Feeds</a></li> <li><a href='#' class='repo_filter' rel='commits'>Commits</a></li> <li><a href='#' class='repo_filter' rel='comments'>Comments</a></li> <li><a href='#' class='repo_filter' rel='issues'>Issues</a></li> </ul> </div>" };
	},
	run: function() {
		this.init();
		this.read_feeds();
		this.create_panel();
		this.show_panel();
		this.script_events();
		this.monitor_page();
	},
	Utils: {
		keys: function(obj) {
			var keys = [];
			for(var k in obj) keys.push(k);
			return keys;
		},
		add_style: function(css) {
			var style = document.createElement('style'); style.type = 'text/css'; style.innerHTML = css;
			Ghf.$('head').append(style);
		}
	},
	add_feed: function(name, key, idx) {
		var f = this.feeds[name];
		if(f === undefined) {
			f = { all: [idx] };
			f[key] = [idx];
		}
		else if(f[key] === undefined) {
			f[key] = [idx];
			f['all'].push(idx);
		}
		else {
			f[key].push(idx);
			f['all'].push(idx);
		}
		this.feeds[name] = f;
		this.counts['all']++;
		this.counts[key]++;
	},
	read_feeds: function() {
		var self = this;
		Ghf.$('div.alert').each(function(idx) {
			var title = Ghf.$(this).find('div.title');
			var cat = Ghf.$(this).attr("class").split(' ')[1], x = -1;
			switch(cat) {
				case 'issues_opened': case 'issues_reopened': case 'issues_closed':
					x = 2, cat = 'issues';
				break;
				case 'issues_comment': case 'commit_comment':
					x = cat === 'issues_comment' ? 2 : 1, cat = 'comments';
				break;
				case 'push':
					x = 1, cat = 'commits';
				break;
			}
			if(x != -1)
				self.add_feed(Ghf.$(title.find('a')[x]).html(), cat, idx);
		});
	},
	create_panel: function() {
		var self = this;
		var repos = self.Utils.keys(self.feeds);
		self.ui.body.push('<ul id="feed_listing" class="repo_list">');
		for each(repo in repos) {
			var r = repo.split('/');
			var cats = self.Utils.keys(self.feeds[repo]);
			self.ui.body.push('<li class="public ' + cats.join(' ') + '"><a class="feedlink" href="#"><span class="owner">' + r[0] + '</span>/<span class="repo">' + r[1] + '</span></a>');
			Ghf.$.each(cats, function(idx, val) {
				self.ui.body.push('<span class="spancount" rel="' + val + '">(' + self.feeds[repo][val].length + ')</span>');
			});
			self.ui.body.push('</li>');
		}
		self.ui.body.push('</ul>');

		this.Utils.add_style('.feedlink { background:none !important; display:inline-block !important; } \n' + '.spancount { padding:0px 2px 5px 0 !important; color:#99A4AA !important; font-size:14px !important; }');
	},
	show_panel: function() {
		Ghf.$('div#your_feeds').remove();
		Ghf.$('div#your_repos').after(this.ui.top_bar + this.ui.body.join('') + this.ui.bottom_bar);
	},
	script_events: function() {
		var self = this;
		self.set_spans('all');

		Ghf.$("#your_feeds").repoList({ selector: "#feed_listing" });
		Ghf.$("#feed_listing li a").click(function() {
			self.hide_feeds();
			Ghf.$.each(self.feeds[Ghf.$(this).text()][Ghf.$(this).siblings('span:visible').attr('rel')], self.show_feed_n);
		});

		Ghf.$("#your_feeds .repo_filter").click(function() {
			var r = Ghf.$(this).attr('rel');
			self.set_spans(r);
			self.hide_feeds();
			Ghf.$.each(Ghf.$('ul#feed_listing li:visible a'), function(i, item) {
				Ghf.$.each(self.feeds[Ghf.$(item).text()][r], self.show_feed_n);
			});
		});
	},
	monitor_page: function() {
		Ghf.$('div.news').ajaxComplete(function(evt, reqt, settings){
			if(/dashboard\/index/.test(settings.url))
				Ghf.run();
		});
	},
	hide_feeds: function() {
		Ghf.$('div.alert').hide();
	},
	show_feed_n: function(i, n) {
		Ghf.$('div.alert:eq(' + n + ')').show();
	},
	set_count: function(n) {
		Ghf.$("#your_feeds h2.count em").html("(" + n + ")");
	},
	set_spans: function(rel) {
		var list = Ghf.$('ul#feed_listing');
		this.set_count(this.counts[rel]);
		list.find("span[rel]").hide();
		list.find('span[rel="' + rel + '"]').show();
	}
};

Ghf.run();
