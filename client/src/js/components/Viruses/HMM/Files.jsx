/**
 * @license
 * The MIT License (MIT)
 * Copyright 2015 Government of Canada
 *
 * @author
 * Ian Boyes
 *
 * @exports HMMFiles
 */

'use strict';

var React = require('react');
var Row = require('react-bootstrap/lib/Row');
var Col = require('react-bootstrap/lib/Col');
var Modal = require('react-bootstrap/lib/Modal');
var Badge = require('react-bootstrap/lib/Badge');
var Alert = require('react-bootstrap/lib/Alert');
var ListGroup = require('react-bootstrap/lib/ListGroup');
var ListGroupItem = require('react-bootstrap/lib/ListGroupItem');

var Icon = require('virtool/js/components/Base/Icon.jsx');
var Flex = require('virtool/js/components/Base/Flex.jsx');
var Pulse = require('virtool/js/components/Base/Pulse.jsx');
var ByteSize = require('virtool/js/components/Base/ByteSize.jsx');

var HMMErrors = require("./Errors.jsx");

/**
 * A component the contains child components that modify certain general options. A small explanation of each
 * subcomponent is also rendered.
 */
var HMMFiles = React.createClass({

    propTypes: {
        show: React.PropTypes.bool.isRequired,
        onHide: React.PropTypes.func.isRequired
    },

    getInitialState: function () {
        return {
            files: null,
            errors: null,

            pressing: false,
            cleaning: false
        };
    },

    checkFiles: function () {
        this.setState(this.getInitialState(), function () {
            dispatcher.db.hmm.request("check_files").success(function (data) {
                this.setState({
                    files: data.files,
                    errors: data.errors,
                });
            }, this);
        });
    },

    press: function () {
        this.setState({pressing: true}, function () {
            dispatcher.db.hmm.request("press").success(function () {
                this.setState({
                    pressing: false,
                    cleaning: false
                }, this.checkFiles);
            }, this);
        });
    },

    clean: function () {
        this.setState({cleaning: true}, function () {
            dispatcher.db.hmm.request("clean", {
                cluster_ids: this.state.errors["not_in_file"]
            }).success(this.checkFiles, this);
        });
    },

    reset: function () {
        this.setState(this.getInitialState());
    },

    render: function () {

        var content;

        var hasErrors = !_.every(_.values(this.state.errors), function (value) {
            return value === false;
        });

        if (this.state.files || hasErrors) {

            var files;

            if (this.state.files.length > 0) {
                var fileComponents = _.sortBy(this.state.files, "_id").map(function (file, index) {
                    return (
                        <ListGroupItem key={index}>
                            <Row>
                                <Col md={6}>
                                    <Icon name="file" /> {file._id}
                                </Col>
                                <Col md={6}>
                                    <ByteSize bytes={file.size} />
                                </Col>
                            </Row>
                        </ListGroupItem>
                    );
                });

                files = (
                    <div>
                        <ListGroup>
                            {fileComponents}
                        </ListGroup>
                    </div>
                );
            }

            var errors = hasErrors ? (
                <HMMErrors
                    {...this.state}
                    clean={this.clean}
                    press={this.press}
                    checkFiles={this.checkFiles}
                />
            ): null;

            content = (
                <div>
                    {files}
                    {errors}
                </div>
            );
        } else {
            content = (
                <Flex justifyContent="center">
                    <Flex.Item>
                        <Pulse color="#337ab7" size="50px" />
                    </Flex.Item>
                </Flex>
            );
        }

        return (
            <Modal show={this.props.show} onHide={this.props.onHide} onEntered={this.checkFiles} onExited={this.reset}>

                <Modal.Header onHide={this.props.onHide} closeButton>
                    HMM Files {this.state.files ? <Badge>{this.state.files.length}</Badge>: null}
                </Modal.Header>

                <Modal.Body>
                    {content}
                </Modal.Body>

            </Modal>
        );



    }
});

module.exports = HMMFiles;
