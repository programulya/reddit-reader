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
    onGetCommentsClicked: function (commentLink) {
        var self = this;
        var name = 'fn' + Date.now();
        var script = document.createElement('script');
        script.src = this.props.link + '?jsonp=' + name;

        window[name] = function (jsonData) {
            self.setState({commentItems: jsonData.data.children});
            delete window[name];
        };
    },

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
                            <CommentButton onHeaderText={item.data.num_comments} link={commentLink} onGetCommentsClicked={self.onGetCommentsClicked} />
                            <Parent caption={item.data.num_comments}/>
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
    onClick: function () {
        this.props.itemSelected(this.props.item);
    },

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

var CommentButton = React.createClass({
    render: function () {
        return (
            <p onClick={this.props.onGetCommentsClicked(this.props.link)}>{this.props.onHeaderText} comments</p>
        )
    }
});

var Child = React.createClass({
    render: function () {
        return <p onClick={this.handleClick} ref="myButton" type="button">{this.handleTitleChange}</p>;
    },

    handleClick: function () {
        this.props.onClick(this);
    },

    handleTitleChange: function () {
        this.props.caption(this);
    }
});

var Parent = React.createClass({
    render: function () {
        return (
            <Child onClick={this.handleClick} caption={this.props.getCaption}/>
        );
    },

    handleClick: function (childComponent) {
        alert(childComponent.refs.myButton);
        alert('The Child button text is: "' + childComponent.refs.myButton.getDOMNode().innerText + '"');
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
            activeNavigationUrl: '',
            menuItems: [{id: 'hot', url: url + '/hot.json'},
                {id: 'new', url: url + '/new.json'},
                {id: 'rising', url: url + '/rising.json'},
                {id: 'controversial', url: url + '/controversial.json'},
                {id: 'top', url: url + '/top.json'}],
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