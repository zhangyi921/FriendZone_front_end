import React, { Component } from 'react';
import { CardImg, CardSubtitle, Collapse, InputGroup, InputGroupAddon, Input, Form, FormGroup, CardHeader, Card, CardBody, Button, CardTitle, CardText, Row, Col } from 'reactstrap';
import Markdown from 'markdown-to-jsx';

var host_url = 'https://project-cmput404.herokuapp.com';
//host_url = 'http://127.0.0.1:8000';

function CommentList(props){
    const comments = props.comments;
    const commentItems = comments.map(
        (comment) =>
        <li className="comment" >
            {comment.author.displayName == undefined &&
                <p>{"Author: "+comment.author}</p>
            }
            {comment.author.displayName != undefined &&
                <p>{"Author: "+comment.author.displayName}</p>
            }
            <p>{"Comment: "+ comment.comment}</p>
        </li>
    );
    return(
        <ul>{commentItems}</ul>
    )
}

class Post extends Component{
    constructor(props) {
        super(props);
        this.postComment = this.postComment.bind(this);
        this.toggle = this.toggle.bind(this);
        this.state = {
            data:{
                "postid": "",
                "publicationDate": "",
                "title": "title",
                "source": "",
                "origin": "",
                "contentType": "",
                "author": {
                    "url": "",
                    "author_id": "",
                    "firstName": null,
                    "lastName": "",
                    "username": "",
                    "hostName": "",
                    "githubUrl": ""
                },
                "content": "content",
                "images":[{'img': ''}],
                "permission": "",
                "categories": [],
                "comments": [],
                "unlisted": false,
                "visibleTo": []
            },
            comments: [],
            getComment: false,
            useOldComments: true
        };
    }
    
    toggle() {
        this.setState(state => ({ collapse: !state.collapse }));
    }
    

    postComment(){
        // console.log(document.getElementById("commentText").value);
        var data;
        var today = new Date();
        if (this.state.data.origin.includes("conet")){
            data = {
            "query": "addComment",
            "post": this.state.data.origin,
            "comment": {
                "author": {
                    "id": this.state.data.author.id,
                    "host": this.state.data.author.hostName,
                    "displayName":this.state.data.author.username,
                    "url": this.state.data.author.url,
                },
                "comment": document.getElementById(this.state.data.id).value,
                "contentType": "text/plain",
                "published": today.toISOString(),
                "id": this.state.data.id,
                }
            }
        } else{
            data = {
                "query": "addComment",
                "post": this.state.data.origin+"/api/posts/"+this.state.data.postid+'/comments/',
                "comment": {
                    "author": {
                        "id": this.state.data.author.author_id,
                        "host": this.state.data.author.hostName,
                        "displayName":this.state.data.author.username,
                        "url": this.state.data.author.url,
                    },
                    "comment": document.getElementById(this.state.data.postid).value,
                    "contentType": "text/plain",
                    "published": today.toISOString(),
                    "id": this.state.data.postid,
                }
            }
        }
        console.log(data);
        fetch(host_url+"/api/posts/"+data.comment.id+'/comments/', {
            method: 'POST', // or 'PUT'
            body: JSON.stringify(data), // data can be `string` or {object}!
            headers:{
                'Content-Type': 'application/json',
                'Authorization': 'token '+this.props.author_state.token,
            }
            })
            .then(res => res.json())
            .then(response => {
            // console.log('Success:', JSON.stringify(response));
            if (response.hasOwnProperty("success")){
                
                // console.log(response);
                this.setState({getComment: true});
            }
        
            })
            .catch(error => console.error('Error:', error));
    }

    render(){
        // this.setState({data: this.props.value});
        this.state.data = this.props.value;
        this.state.author_state = this.props.author_state;
        // console.log(this.props);
        if (this.state.useOldComments){
            this.state.comments = this.props.value.comments;
        }
        
        if (this.state.getComment && !this.state.data.origin.includes("conet")){
            this.state.comments = [];
            var url = this.state.data.origin+"/api/posts/"+this.state.data.postid+"/comments/";
            fetch(url, {
                method: 'GET',
                headers:{
                'Content-Type': 'application/json',
                }
            })
            .then(res => res.json())
            .then(response => {
                // console.log(response);
                var textbox = document.getElementById(this.state.data.postid);
                textbox.value = 'Leave a comment!';
                this.setState({comments: response.comments, getComment: false, useOldComments: false});
                // console.log(this.state.comments);
            })
            .catch(error => console.error('Error:', error));
        }
        if (this.state.data.title !== "Github Event"){
            var content = (<Markdown>{this.state.data.content}</Markdown>);
            if (this.state.data.contentType == "application/base64" || this.state.data.contentType == "image/png;base64" || this.state.data.contentType == "image/jpeg;base64"){
                var image = (
                    <div>
                        <Button color="secondary" onClick={this.toggle} size="sm" block>⇩ ⇩ ⇩ Click to show picture ⇩ ⇩ ⇩</Button>
                        <Collapse isOpen={this.state.collapse}>
                            <CardImg top width="100%" src={this.state.data.content} alt="Card image cap" />
                        </Collapse>
                    </div>
                );
                var content = (<div></div>);
            }
            if (this.state.data.author.hasOwnProperty('displayName')){
                this.state.data.author.username = this.state.data.author.displayName;
            }
            if (this.state.data.hasOwnProperty('published')){
                this.state.data.publicationDate = this.state.data.published
            }
            return (
                <Card>
                    
                    {image}
                    
                    <CardHeader tag="h3">{this.state.data.title}</CardHeader>
                    <CardBody>
                        <CardText>{"Author: "+this.state.data.author.username}</CardText> 
                        <hr></hr>
                        <CardText>{"Origin: "+this.state.data.origin}</CardText>
                        <hr></hr>
                        {content}
                        <hr></hr>
                        <CardText>{(new Date(this.state.data.publicationDate)).toDateString()}</CardText>
                        <CardText>{(new Date(this.state.data.publicationDate)).toTimeString()}</CardText>
                        <CardHeader tag="h4">Comment: </CardHeader>
                        <CommentList comments = {this.state.comments} />
                        {this.state.data.origin.includes("conet") &&
                            <InputGroup>
                            <Input type="textarea" name="text" id={this.state.data.id} placeholder="Leave a comment!" />
                            <InputGroupAddon addonType="append">
                            <Button onClick={this.postComment} color="secondary">Post!</Button>
                            </InputGroupAddon>
                            </InputGroup>
                        }
                        {!this.state.data.origin.includes("conet") &&
                            <InputGroup>
                            <Input type="textarea" name="text" id={this.state.data.postid} placeholder="Leave a comment!" />
                            <InputGroupAddon addonType="append">
                            <Button onClick={this.postComment} color="secondary">Post!</Button>
                            </InputGroupAddon>
                            </InputGroup>
                        }
                    </CardBody>
                </Card>
            )
        } else {
            return (
                <Card>
                    {/* <CardImg top width="100%" src="https://github.githubassets.com/images/modules/open_graph/github-mark.png" alt="Card image cap" /> */}
                    <CardHeader tag="h3"><i style={{ fontSize: 30, width:60}} class="fab fa-github"></i>{this.state.data.title}</CardHeader>
                    <CardBody>
                        <CardText>{"Author: "+this.state.data.author.userName}</CardText> 
                        <hr></hr>
                        <CardText>{(new Date(this.state.data.publicationDate)).toDateString()}</CardText>
                        <CardText>{(new Date(this.state.data.publicationDate)).toTimeString()}</CardText>
                        <hr></hr>
                        <CardText>{this.state.data.content}</CardText>
                    </CardBody>
                </Card>
            )
        }
        
    }
}

export default Post;