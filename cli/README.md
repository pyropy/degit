## Prerequisites

1. Install golang
2. Install local IPFS node and run `ipfs init` and afterwards `ipfs daemon`
3. Install prerequisite by running `make prerequisites`
4. On macOS you'd have to copy `git-remote-ipld` over to git plugins directory
5. Install bacalhau `https://docs.bacalhau.org/getting-started/installation`

## Setup

1. `make install`
2. `npm run build`

## Commands

```
degit setup -r <rpc url> -- sets up global dgit config
degit init <repo path> -- sets up dgit repository
degit push <branch name> -- performs push to dgit repository and on-chain interaction
degit checkout <branch name> -- checks out newest HEAD from the dgit repository
```
