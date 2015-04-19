// Menu
var MenuItem = React.createClass({
    onClick: function () {
        this.props.itemSelected(this.props.item);
    },

    render: function () {
        return (
            <li onClick={this.onClick} className={this.props.selected ? 'selected' : ''}>
                {this.props.item.id}
            </li>
        );
    }
});

var MenuList = React.createClass({
    setSelectedItem: function (item) {
        this.props.itemSelected(item);
    },

    render: function () {
        var self = this;
        var initItem = self.props.initItem;

        var items = this.props.items.map(function (item) {
            return (
                <MenuItem key={item.id}
                    item={item} itemSelected={self.setSelectedItem}
                    selected={item.url === self.props.activeUrl} />
            );
        });

        return (
            <div>
                <ul className="menu">
                    {items}
                </ul>
            </div>
        );
    }
});

// Posts
var PostList = React.createClass({
    ticksToHours: function (ticks) {
        var minutes = 1000 * 60;
        var hours = minutes * 60;

        var d = new Date();
        var currentTicks = d.getTime();
        var startTicks = new Date(ticks * 1000);
        var deltaTicks = currentTicks - startTicks;

        return Math.round(deltaTicks / hours);
    },

    render: function () {
        var self = this;

        var storyNodes = this.props.items.map(function (item) {
            var redditUrl = 'http://www.reddit.com';
            var hours = self.ticksToHours(item.data.created_utc);
            var commentLink = redditUrl + item.data.permalink + '.json';
            var thumbnailLink = item.data.thumbnail;
            var isThumbnail = thumbnailLink.substr(thumbnailLink.length - 4) === '.jpg';

            return (
                <div className="post" key={item.data.url}>
                    <div className="score">
                        <p>{item.data.score}</p>
                    </div>

                    <div className={isThumbnail === true ? 'thumbnail' : 'hidden'}>
                        <img src={isThumbnail === true ? item.data.thumbnail : ''}></img>
                    </div>

                    <div className="post-info">
                        <div className="post-header">
                            <a href={item.data.url}>
                                {item.data.title}
                            </a>
                            <label className="post-domain">({item.data.domain})</label>
                        </div>
                        <div className="post-author">
                            <span>
                                Submitted {hours} hours ago by <b className="post-author-name">{item.data.author}</b>
                            </span>
                            <label className="post-subreddit"> to {item.data.subreddit}</label>
                        </div>
                        <div className="post-comments-counter">

                            <CommentsButton url={commentLink} caption={item.data.num_comments}/>
                        </div>
                    </div>
                </div>
            );
        });

        return (
            <div>
                {storyNodes}
            </div>
        );
    }
});

// Comments
var CommentItem = React.createClass({
    render: function () {
        return (
            <li>
                {this.props.item.id}
            </li>
        );
    }
});

var CommentList = React.createClass({
    render: function () {
        var self = this;

        var items = this.props.items.map(function (item) {
            return (
                <CommentItem key={item.id} item={item}/>
            );
        });

        return (
            <div>
                <ul>
                    {items}
                </ul>
            </div>
        );
    }
});

var CommentsButton = React.createClass({
    getInitialState: function () {
        return ({
            comments: []
        });
    },

    handleClick: function (childComponent) {
        var self = this;
        var name = 'fn' + Date.now();
        var script = document.createElement('script');
        script.src = this.props.url + '?jsonp=' + name;

        window[name] = function (jsonData) {
            self.setState({comments: jsonData});
            delete window[name];
        };

        document.head.appendChild(script);
    },

    render: function() {
        var self = this;
        return (
            <div>
                <p onClick={this.handleClick}>{self.props.caption} comments</p>
                <CommentList items={self.state.comments}/>
            </div>
        )
    }
});

// App
var App = React.createClass({

    componentDidMount: function () {
        var self = this;
        var name = 'fn' + Date.now();
        var script = document.createElement('script');

        window[name] = function () {
            self.setState({
                menuItems: this.state.menuItems
            });

            delete window[name];
        };

        document.head.appendChild(script);
        this.loadFirstPostItems(this.state.initItem);
    },

    getInitialState: function () {
        var redditUrl = 'http://www.reddit.com';
        var query = window.location.search;

        var subReddit = '';
        if (query.indexOf('?/') === 0) {
            subReddit = '/r/' + query.substring(2);
        }

        var url = redditUrl + subReddit;

        return ({
            activeNavigationUrl: url + '/hot.json',
            menuItems: [{id: 'hot', url: url + '/hot.json'},
                {id: 'new', url: url + '/new.json'},
                {id: 'rising', url: url + '/rising.json'},
                {id: 'controversial', url: url + '/controversial.json'},
                {id: 'top', url: url + '/top.json'}],
            initItem: {id: 'hot', url: url + '/hot.json'},
            postItems: []
        });
    },

    render: function () {
        return (
            <div>
                <div>
                    <img src="images/reddit-icon.png" className="image-header"></img>
                    <h1>Reddit reader</h1>
                    <MenuList activeUrl={this.state.activeNavigationUrl}
                        items={this.state.menuItems}
                        itemSelected={this.setSelectedItem} />
                    <PostList items={this.state.postItems} />
                </div>
            </div>
        );
    },

    loadFirstPostItems: function(item) {
        var self = this;
        var name = 'fn' + Date.now();
        var script = document.createElement('script');
        script.src = item.url + '?limit=25&sort=top&jsonp=' + name;

        window[name] = function (jsonData) {
            self.setState({postItems: jsonData.data.children});
            delete window[name];
        };
        document.head.appendChild(script);
    },

    setSelectedItem: function (item) {
        var self = this;
        var name = 'fn' + Date.now();
        var script = document.createElement('script');
        script.src = item.url + '?limit=25&sort=top&jsonp=' + name;

        window[name] = function (jsonData) {
            self.setState({postItems: jsonData.data.children});
            delete window[name];
        };

        document.head.appendChild(script);

        this.setState({
            activeNavigationUrl: item.url,
            title: item.id
        });
    }
});

React.render(<App></App>, document.body);