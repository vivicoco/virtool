import React from "react";
import { connect } from "react-redux";
import { Switch, Route, Redirect } from "react-router-dom";
import { push } from "connected-react-router";
import { get } from "lodash-es";
import { LinkContainer } from "react-router-bootstrap";
import { Badge, Nav, NavItem, Dropdown, MenuItem } from "react-bootstrap";
import { LoadingPlaceholder, Icon, ViewHeader, Flex, FlexItem, RelativeTime, NotFound } from "../../../base";
import IndexDetail from "../../../indexes/components/Detail";
import OTUDetail from "../../../otus/components/Detail/Detail";
import { checkRefRight, followDownload } from "../../../utils/utils";
import { getReference } from "../../actions";
import OTUList from "../../../otus/components/List";
import Indexes from "../../../indexes/components/Indexes";
import SourceTypes from "../SourceTypes";
import InternalControl from "./InternalControl";
import ReferenceMembers from "./Members";
import ReferenceManage from "./Manage";
import EditReference from "./Edit";

class CustomToggle extends React.Component {
    // Bootstrap Dropdown requires custom dropdown components to be class components
    // in order to use refs.
    render() {
        return (
            <Icon
                name="ellipsis-v"
                tip="Options"
                onClick={this.props.onClick}
                style={{ fontSize: "65%", paddingLeft: "5px" }}
            />
        );
    }
}

const ReferenceSettings = ({ isRemote }) => (
    <div className="settings-container">
        {isRemote ? null : <SourceTypes />}
        <InternalControl global />
        <ReferenceMembers noun="users" />
        <ReferenceMembers noun="groups" />
    </div>
);

class ReferenceDetail extends React.Component {
    constructor(props) {
        super(props);
        this.props.onGetReference(this.props.match.params.refId);
    }

    handleSelect = key => {
        followDownload(`/download/refs/${this.props.match.params.refId}?scope=${key}`);
    };

    render = () => {
        if (this.props.error) {
            return <NotFound />;
        }

        if (this.props.detail === null || this.props.detail.id !== this.props.match.params.refId) {
            return <LoadingPlaceholder />;
        }

        const { name, id, remotes_from, created_at, user } = this.props.detail;

        let headerIcon;
        let exportButton;

        if (this.props.pathname === `/refs/${id}/manage`) {
            headerIcon = remotes_from ? (
                <Icon bsStyle="default" name="lock" pullRight style={{ fontSize: "65%" }} />
            ) : null;

            headerIcon =
                this.props.canModify && !remotes_from ? (
                    <Icon
                        bsStyle="warning"
                        name="pencil-alt"
                        tip="Edit"
                        onClick={this.props.onEdit}
                        pullRight
                        style={{ fontSize: "65%" }}
                    />
                ) : (
                    headerIcon
                );

            exportButton = (
                <Dropdown id="dropdown-export-reference" className="dropdown-export-reference">
                    <CustomToggle bsRole="toggle" />
                    <Dropdown.Menu className="export-ref-dropdown-menu">
                        <MenuItem header>Export</MenuItem>
                        <MenuItem eventKey="built" onSelect={this.handleSelect}>
                            Built
                        </MenuItem>
                        <MenuItem eventKey="unbuilt" onSelect={this.handleSelect}>
                            Unbuilt
                        </MenuItem>
                        <MenuItem eventKey="unverified" onSelect={this.handleSelect}>
                            Unverified
                        </MenuItem>
                    </Dropdown.Menu>
                </Dropdown>
            );
        }

        const referenceHeader = (
            <ViewHeader title={`${name} - References`}>
                <Flex alignItems="flex-end">
                    <FlexItem grow={1}>
                        <Flex>
                            <strong>{name}</strong>
                        </Flex>
                    </FlexItem>
                    {headerIcon}
                    {exportButton}
                </Flex>
                <div className="text-muted" style={{ fontSize: "12px" }}>
                    Created <RelativeTime time={created_at} /> by {user.id}
                </div>
            </ViewHeader>
        );

        return (
            <div className="detail-container">
                <Switch>
                    <Route path="/refs/:refId/otus/:otuId" component={OTUDetail} />
                    <Route path="/refs/:refId/indexes/:indexId" component={IndexDetail} />
                    <Route
                        path="/refs"
                        render={() => (
                            <div>
                                {referenceHeader}

                                <Nav bsStyle="tabs">
                                    <LinkContainer to={`/refs/${id}/manage`}>
                                        <NavItem>Manage</NavItem>
                                    </LinkContainer>
                                    <LinkContainer to={`/refs/${id}/otus`}>
                                        <NavItem>
                                            OTUs <Badge>{this.props.detail.otu_count}</Badge>
                                        </NavItem>
                                    </LinkContainer>
                                    <LinkContainer to={`/refs/${id}/indexes`}>
                                        <NavItem>Indexes</NavItem>
                                    </LinkContainer>
                                    <LinkContainer to={`/refs/${id}/settings`}>
                                        <NavItem>Settings</NavItem>
                                    </LinkContainer>
                                </Nav>

                                <Switch>
                                    <Redirect from="/refs/:refId" to={`/refs/${id}/manage`} exact />
                                    <Route path="/refs/:refId/manage" component={ReferenceManage} />
                                    <Route path="/refs/:refId/otus" component={OTUList} />
                                    <Route path="/refs/:refId/indexes" component={Indexes} />
                                    <Route
                                        path="/refs/:refId/settings"
                                        render={() => <ReferenceSettings isRemote={remotes_from} />}
                                    />
                                </Switch>

                                <EditReference />
                            </div>
                        )}
                    />
                </Switch>
            </div>
        );
    };
}

const mapStateToProps = state => ({
    error: get(state, "errors.GET_REFERENCE_ERROR", null),
    detail: state.references.detail,
    pathname: state.router.location.pathname,
    canModify: checkRefRight(state, "modify")
});

const mapDispatchToProps = dispatch => ({
    onGetReference: refId => {
        dispatch(getReference(refId));
    },

    onEdit: () => {
        dispatch(push({ ...window.location, state: { editReference: true } }));
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ReferenceDetail);
