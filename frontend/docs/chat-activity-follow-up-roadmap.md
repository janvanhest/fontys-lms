# Chat Activity Follow-up Roadmap

This file is a reminder for the slices intentionally left out of the first branch.

## Branch 1

`chat can read activities intelligently`

Included:

- read-only `search_activities` tool
- explicit activity questions
- proactive activity lookup
- structured filters
- stream status feedback in chat

Excluded:

- UI actions
- writes
- side panel automation

## Branch 2

`chat ui actions`

Goal:

- let the chat backend emit structured UI commands
- allow the frontend to react to those commands safely

Likely scope:

- open activities side panel
- focus activities context
- select or highlight a specific activity

Notes:

- automatic UI changes should be constrained
- read-only retrieval and UI actions should stay decoupled

## Branch 2.5 (or Branch 3 pre-req)

`chat highlight activity`

Goal:

- let the chat select or highlight a specific activity in the side panel

Likely scope:

- lift `selectedActivityId` from `useActivitiesPanelState` into `LayoutContext`
- extend `perform_ui_action` with `action: 'highlight_activity'` and an `activityId` field

Notes:

- blocked on `selectedActivityId` moving to layout context
- small change once that pre-req is done

## Branch 3

`chat activity writes`

Goal:

- enable chat-driven mutations on activities

Likely scope:

- update activity status
- edit selected activity fields
- create confirmation flows before write execution

Notes:

- this branch needs stronger safeguards
- permissions and confirmation behavior should be explicit

## Branch 4

`chat retrieval refinement`

Goal:

- improve result quality after the first read-only slice is stable

Likely scope:

- ranking improvements
- better fallback behavior
- richer match explanations
- optional sorting controls if needed later

Notes:

- only do this after the baseline retrieval flow proves useful
