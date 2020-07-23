# Yandex object storage static website

Deploy [static website to Yandex Object Storage](https://cloud.yandex.ru/docs/storage/operations/hosting/setup)

## Configuration

| Key               | Value                                        | Type      | Required |
| ----------------- | -------------------------------------------- | --------- | -------- |
| `accessKeyId`     | Service account access key id                | `string`  | Yes      |
| `secretAccessKey` | Service account secret access key            | `string`  | Yes      |
| `bucket`          | Bucket name                                  | `string`  | Yes      |
| `path`            | Path to upload folder                        | `string`  | Yes      |
| `clear`           | Clear bucket before deploy (default: `true`) | `boolean` | No       |

## Example

```yaml
name: Deploy

on:
    push:
        branches:
            - master

jobs:
    deploy:
        runs-on: ubuntu-latest
        strategy:
            matrix:
                node-version: [12.x]
        steps:
            - uses: actions/checkout@v2
            - uses: actions/setup-node@v1
              with:
                  node-version: ${{ matrix.node-version }}
            # Build
            - run: npm ci
            - run: npm run build
            # Deploy
            - uses: nekitcorp/yandex-storage-website-action@v1
              with:
                  accessKeyId: ${{ secrets.ACCESS_KEY_ID }}
                  secretAccessKey: ${{ secrets.SECRET_ACCESS_KEY }}
                  bucket: ${{ secrets.BUCKET }}
                  path: "./build"
                  clear: true
```
