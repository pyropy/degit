## Pre-requisits

1. Install golang
2. Install local IPFS node and run `ipfs init` and afterwards `ipfs daemon`
3. Install pre-requisits by running `make pre-requisits`
4. On macOS you'd have to copy `git-remote-ipld` over to git plugins directory

## Setup

1. `make install`

## Commands

```
dgit setup -- sets up global dgit config
dgit init <repo path> -- sets up dgit repository
dgit push <branch name> -- performs push to dgit repository and on-chain interaction
dgit checkout <branch name> -- checks out newest HEAD from the dgit repository
```
