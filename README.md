# Custom Turing

Lightweight C IDE in browser.

## How to run using docker
Build docker image using:
```
docker build --tag custom-turing .
```

And then run your image:
```
docker run -p 8080:8080 custom-turing
```

Navigate browser to `http://localhost:8080`.

## How to run without docker
1. Be sure you meet all requirements stated below. `sudo apt-get install valgrind`
2. Copy all files into public www folder.
3. Make sure your web daemon has read and write access to `data/` folder. Usually it runs as www-data. `sudo chown www-data:www-data data/`
4. That's all.

### Requirements
- **Apache 2** or another server
- `php 7` with allowed **exec** function
- `gcc` compiler
- `valgrind` debugger

