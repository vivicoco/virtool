import {
    WS_INSERT_ANALYSIS,
    WS_UPDATE_ANALYSIS,
    WS_REMOVE_ANALYSIS,
    BLAST_NUVS,
    CLEAR_ANALYSIS,
    COLLAPSE_ANALYSIS,
    FIND_ANALYSES,
    GET_ANALYSIS,
    LIST_READY_INDEXES,
    SET_PATHOSCOPE_SORT_KEY,
    TOGGLE_ANALYSIS_EXPANDED,
    TOGGLE_SORT_PATHOSCOPE_DESCENDING,
    TOGGLE_SHOW_PATHOSCOPE_READS,
    SET_PATHOSCOPE_FILTER
} from "../../app/actionTypes";
import reducer, {
    initialState as reducerInitialState,
    collapse,
    setFilter,
    setNuvsBLAST,
    toggleExpanded
} from "../reducer";

describe("Analyses Reducer", () => {
    const initialState = reducerInitialState;

    it("should return the initial state on first pass", () => {
        const result = reducer(undefined, {});
        expect(result).toEqual(initialState);
    });

    it("should return the given state for unhandled action types", () => {
        const action = { type: "UNHANDLED_ACTION" };
        const result = reducer(initialState, action);
        expect(result).toEqual(initialState);
    });

    describe("should handle WS_INSERT_ANALYSIS", () => {
        it("it should insert analysis into [documents]", () => {
            const state = {
                ...initialState,
                documents: null,
                sampleId: "foo"
            };
            const action = {
                type: WS_INSERT_ANALYSIS,
                data: {
                    id: "foo",
                    created_at: "2018-01-01T00:00:00.000000Z"
                }
            };
            const result = reducer(state, action);
            expect(result).toEqual({
                ...state,
                documents: [action.data]
            });
        });
    });

    it("should handle WS_UPDATE_ANALYSIS", () => {
        const state = {
            ...initialState,
            sampleId: "baz",
            documents: [{ id: "123abc", created_at: "2018-01-01T00:00:00.000000Z", foo: "test", sample: { id: "baz" } }]
        };

        const action = {
            type: WS_UPDATE_ANALYSIS,
            data: {
                id: "123abc",
                created_at: "2018-01-01T00:00:00.000000Z",
                foo: "bar",
                sample: {
                    id: "baz"
                }
            }
        };
        const result = reducer(state, action);
        expect(result).toEqual({
            ...state,
            documents: [action.data]
        });
    });

    it("should handle WS_REMOVE_ANALYSIS", () => {
        const state = {
            ...initialState,
            documents: [{ id: "foo" }]
        };
        const action = {
            type: WS_REMOVE_ANALYSIS,
            data: ["foo"]
        };
        const result = reducer(state, action);
        expect(result).toEqual({
            ...state,
            documents: []
        });
    });

    it("should handle COLLAPSE_ANALYSIS", () => {
        const state = {
            ...initialState,
            data: []
        };
        const action = { type: COLLAPSE_ANALYSIS };
        const result = reducer(state, action);
        expect(result).toEqual(state);
    });

    it("should handle SET_PATHOSCOPE_FILTER", () => {
        const state = {
            ...initialState,
            filterIsolates: false,
            filterOTUs: false
        };
        const action = { type: SET_PATHOSCOPE_FILTER, key: undefined };
        const result = reducer(state, action);
        expect(result).toEqual({
            ...state,
            filterIsolates: true,
            filterOTUs: true
        });
    });

    it("should handle TOGGLE_SHOW_PATHOSCOPE_READS", () => {
        const state = initialState;
        const action = { type: TOGGLE_SHOW_PATHOSCOPE_READS };
        const result = reducer(state, action);
        expect(result).toEqual({
            ...state,
            showReads: !state.showReads
        });
    });

    it("should handle TOGGLE_SORT_PATHOSCOPE_DESCENDING", () => {
        const state = initialState;
        const action = { type: TOGGLE_SORT_PATHOSCOPE_DESCENDING };
        const result = reducer(state, action);
        expect(result).toEqual({
            ...state,
            sortDescending: !state.sortDescending
        });
    });

    it("should handle SET_PATHOSCOPE_SORT_KEY", () => {
        const state = initialState;
        const action = { type: SET_PATHOSCOPE_SORT_KEY, key: "test" };
        const result = reducer(state, action);
        expect(result).toEqual({ ...state, sortKey: action.key });
    });

    it("should handle TOGGLE_ANALYSIS_EXPANDED", () => {
        const state = { ...initialState, data: [] };
        const action = { type: TOGGLE_ANALYSIS_EXPANDED, id: "test" };
        const result = reducer(state, action);
        expect(result).toEqual({ ...state, data: [] });
    });

    it("should handle LIST_READY_INDEXES_SUCCEEDED", () => {
        const state = initialState;
        const action = { type: LIST_READY_INDEXES.SUCCEEDED, data: [] };
        const result = reducer(state, action);
        expect(result).toEqual({ ...state, readyIndexes: [] });
    });

    it("should handle FIND_ANALYSES_REQUESTED", () => {
        const state = { term: "" };
        const action = { type: FIND_ANALYSES.REQUESTED, term: "foo" };
        const result = reducer(state, action);
        expect(result).toEqual({ ...state, term: "foo" });
    });

    it("should handle FIND_ANALYSES_SUCCEEDED", () => {
        const initialState = { documents: null };
        const action = {
            type: FIND_ANALYSES.SUCCEEDED,
            data: { documents: [] }
        };
        const result = reducer(initialState, action);
        expect(result).toEqual({ ...initialState, documents: [] });
    });

    it("should handle GET_ANALYSIS_REQUESTED", () => {
        const state = {};
        const action = {
            type: GET_ANALYSIS.REQUESTED
        };
        const result = reducer(state, action);
        expect(result).toEqual({
            ...state,
            detail: null,
            data: null
        });
    });

    it("should handle GET_ANALYSIS_SUCCEEDED for nuvs", () => {
        const state = {};
        const action = {
            type: "GET_ANALYSIS_SUCCEEDED",
            algorithm: "nuvs",
            data: {
                diagnosis: []
            }
        };
        const result = reducer(state, action);
        expect(result).toEqual({
            ...state,
            detail: action.data,
            data: action.data
        });
    });

    describe("should handle GET_ANALYSIS_SUCCEEDED for pathoscope", () => {
        it("adds formatted data for ready pathoscope analyses", () => {
            const state = {};
            const action = {
                type: "GET_ANALYSIS_SUCCEEDED",
                data: {
                    algorithm: "pathoscope_bowtie",
                    diagnosis: [],
                    ready: true
                }
            };
            const result = reducer(state, action);
            expect(result).toEqual({
                detail: action.data,
                data: []
            });
        });

        it("otherwise adds unformatted data", () => {
            const state = {};
            const action = {
                type: "GET_ANALYSIS_SUCCEEDED",
                data: {
                    algorithm: "pathoscope_bowtie",
                    diagnosis: [],
                    ready: false
                }
            };
            const result = reducer(state, action);
            expect(result).toEqual({
                detail: action.data,
                data: action.data
            });
        });
    });

    it("should handle CLEAR_ANALYSIS", () => {
        const state = { data: [], detail: {} };
        const action = { type: CLEAR_ANALYSIS };
        const result = reducer(state, action);
        expect(result).toEqual({ data: null, detail: null });
    });

    it("should handle BLAST_NUVS_REQUESTED", () => {
        const state = {
            detail: {
                id: "testid",
                algorithm: "nuvs",
                results: [{ index: 3 }, { index: 5 }]
            }
        };
        const action = {
            type: BLAST_NUVS.REQUESTED,
            analysisId: "testid",
            sequenceIndex: 3
        };
        const result = reducer(state, action);
        expect(result).toEqual({
            ...state,
            detail: {
                ...state.detail,
                results: [{ index: 3, blast: { ready: false } }, { index: 5 }]
            }
        });
    });

    it("should handle BLAST_NUVS_SUCCEEDED", () => {
        const state = {
            detail: {
                id: "testid",
                algorithm: "nuvs",
                results: [{ index: 3 }, { index: 5 }]
            }
        };
        const action = {
            type: BLAST_NUVS.SUCCEEDED,
            analysisId: "testid",
            sequenceIndex: 3,
            data: {}
        };
        const result = reducer(state, action);
        expect(result).toEqual({
            ...state,
            detail: {
                ...state.detail,
                results: [{ index: 3, blast: {} }, { index: 5 }]
            }
        });
    });

    describe("Analyses Reducer Helper Functions", () => {
        describe("collapse", () => {
            it("should set all entries 'expanded' to false", () => {
                const state = {
                    data: [
                        { id: "test1", expanded: true },
                        { id: "test2", expanded: false },
                        { id: "test3", expanded: true }
                    ]
                };
                const result = collapse(state);
                expect(result).toEqual([
                    { id: "test1", expanded: false },
                    { id: "test2", expanded: false },
                    { id: "test3", expanded: false }
                ]);
            });
        });

        describe("setFilter", () => {
            const state = {
                filterIsolates: false,
                filterOTUs: false
            };

            it("toggles filterIsolates when [key='isolates']", () => {
                const result = setFilter(state, "isolates");
                expect(result).toEqual({
                    filterIsolates: true,
                    filterOTUs: false
                });
            });

            it("toggles filterOTUs when [key='OTUs']", () => {
                const result = setFilter(state, "OTUs");
                expect(result).toEqual({
                    filterIsolates: false,
                    filterOTUs: true
                });
            });

            it("toggles both to true when no key is specified and both are false", () => {
                const result = setFilter(state, undefined);
                expect(result).toEqual({
                    filterIsolates: true,
                    filterOTUs: true
                });
            });

            it("toggles both to false when no key is specified and either/both are true", () => {
                const state = {
                    filterIsolates: true
                };
                const result = setFilter(state, undefined);
                expect(result).toEqual({
                    filterIsolates: false,
                    filterOTUs: false
                });
            });
        });

        describe("toggleExpanded", () => {
            const state = {
                data: [
                    { id: "test1", expanded: true },
                    { id: "test2", expanded: false },
                    { id: "test3", expanded: true }
                ]
            };

            it("should toggle specific entry's 'expanded' value", () => {
                const id = "test1";
                const result = toggleExpanded(state, id);
                expect(result).toEqual([
                    { id: "test1", expanded: false },
                    { id: "test2", expanded: false },
                    { id: "test3", expanded: true }
                ]);
            });
        });

        describe("setNuvsBLAST", () => {
            it("when id matches target id, update with blast data", () => {
                const state = {
                    detail: {
                        id: "foo",
                        algorithm: "nuvs",
                        results: [{ index: 3 }, { index: 5 }]
                    }
                };
                const analysisId = "foo";
                const sequenceIndex = 3;
                const data = { payload: "data_to_be_added" };
                const result = setNuvsBLAST(state, analysisId, sequenceIndex, data);
                expect(result).toEqual({
                    ...state,
                    detail: {
                        ...state.detail,
                        results: [{ index: 3, blast: { payload: "data_to_be_added" } }, { index: 5 }]
                    }
                });
            });

            it("otherwise return state", () => {
                const state = {
                    detail: {
                        id: "foo",
                        algorithm: "nuvs",
                        results: [{ index: 3 }, { index: 5 }]
                    }
                };
                const analysisId = "bar";
                const sequenceIndex = 3;
                const result = setNuvsBLAST(state, analysisId, sequenceIndex);
                expect(result).toEqual(state);
            });
        });
    });
});
