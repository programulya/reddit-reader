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
            var hours = self.ticksToHours(item.data.created_utc);
            var commentLink = 'http://www.reddit.com' + item.data.permalink + '.json';
            var isThumbnail = item.data.thumbnail.indexOf('http') === 0;

            return (
                <div className="post" key={item.data.url}>
                    <div className="score">
                        <p>{item.data.score}</p>
                    </div>

                    <div className={isThumbnail ? 'thumbnail' : 'hidden'}>
                        <img src={item.data.thumbnail}></img>
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
                                Submitted {hours} hours ago by
                                <label className="post-author-name">{item.data.author}</label>
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
        return <p onClick={this.handleClick} ref="myButton" type="button"> Click Me </p>;
    },

    handleClick: function () {
        this.props.onClick(this);
    }
});

var Parent = React.createClass({
    render: function () {
        return (
            <Child onClick={this.handleClick} caption={this.getCaption}/>
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
        return ({
            activeNavigationUrl: '',
            menuItems: [{id: 'hot', url: 'http://www.reddit.com/hot.json'},
                {id: 'new', url: 'http://www.reddit.com/new.json'},
                {id: 'rising', url: 'http://www.reddit.com/rising.json'},
                {id: 'controversial', url: 'http://www.reddit.com/controversial.json'},
                {id: 'top', url: 'http://www.reddit.com/top.json'}],
            postItems: [],
            initItem: {id: 'hot', url: 'http://www.reddit.com/hot.json'}
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
                        initItem={this.state.initItem}
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