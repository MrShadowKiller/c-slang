(module
	(memory 1)
	(global $sp (mut i32) (i32.const 65532))
	(global $bp (mut i32) (i32.const 65536))
	(global $hp (mut i32) (i32.const 0))
	(global $r1 (mut i32) (i32.const 0))
	(global $r2 (mut i32) (i32.const 0))
	(func $pow
		(result i32)
		(i32.store (i32.sub (global.get $bp) (i32.const 12)) (i32.load (i32.sub (global.get $bp) (i32.const 4))))
		(if (i32.eq (i32.load (i32.sub (global.get $bp) (i32.const 8))) (i32.const 0)) (then (return (i32.const 1))))
		(i32.store (i32.sub (global.get $bp) (i32.const 16)) (i32.const 1))
		(block $block_0 (loop $loop_0 (br_if $block_0 (i32.eqz (i32.lt_s (i32.load (i32.sub (global.get $bp) (i32.const 16))) (i32.load (i32.sub (global.get $bp) (i32.const 8)))))) (i32.store (i32.sub (global.get $bp) (i32.const 12)) (i32.mul (i32.load (i32.sub (global.get $bp) (i32.const 12))) (i32.load (i32.sub (global.get $bp) (i32.const 4))))) (i32.store (i32.sub (global.get $bp) (i32.const 16)) (i32.add (i32.load (i32.sub (global.get $bp) (i32.const 16))) (i32.const 1))) (br $loop_0)))
		(return (i32.load (i32.sub (global.get $bp) (i32.const 12))))
	)
	(func $main
		(i32.store (i32.sub (global.get $bp) (i32.const 4)) (call $pow (if (i32.le_s (i32.sub (global.get $sp) (i32.const 20)) (global.get $hp)) (then (global.set $r1 (i32.mul (memory.size) (i32.const 65536))) (global.set $r2 (i32.sub (global.get $r1) (i32.const 1))) (global.set $r1 (i32.sub (global.get $r1) (global.get $sp))) (drop (memory.grow (i32.const 1))) (global.set $sp (i32.sub (i32.mul (memory.size) (i32.const 65536)) (global.get $r1))) (global.set $r1 (i32.sub (i32.mul (memory.size) (i32.const 65536)) (i32.const 1))) (block $memcopy_block (loop $memcopy_loop (br_if $memcopy_block (i32.ne (i32.const 0) (i32.lt_s (global.get $r1) (global.get $sp)))) (i32.store (global.get $r1) (i32.load (global.get $r2))) (global.set $r1 (i32.sub (global.get $r1) (i32.const 1))) (global.set $r2 (i32.sub (global.get $r2) (i32.const 1))) (br $memcopy_loop))))) (global.set $sp (i32.sub (global.get $sp) (i32.const 4))) (i32.store (global.get $sp) (global.get $bp)) (global.set $bp (global.get $sp)) (global.set $sp (i32.sub (global.get $sp) (i32.const 16))) (i32.store (i32.sub (global.get $bp) (i32.const 4)) (i32.const 2)) (i32.store (i32.sub (global.get $bp) (i32.const 8)) (i32.const 10))) (global.set $sp (i32.add (global.get $bp) (i32.const 4))) (global.set $bp (i32.load (global.get $bp))))
	)
	(start $main)
)
