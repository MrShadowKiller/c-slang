(module
	(import "js" "mem" (memory 1))
	(import "imports" "print_int" (func $print_int_o (param i32)))
	(global $sp (mut i32) (i32.const 65532))
	(global $bp (mut i32) (i32.const 65536))
	(global $hp (mut i32) (i32.const 40))
	(global $r1 (mut i32) (i32.const 0))
	(global $r2 (mut i32) (i32.const 0))
	(data (i32.const 0) "\05\00\00\00\17\00\00\00\04\00\00\00\07\00\00\00\02\00\00\00\c7\00\00\00\02\00\00\00\04\00\00\00\06\00\00\00\0a\00\00\00")
	(func $merge
		(i32.store (i32.sub (global.get $bp) (i32.const 56)) (i32.load (i32.sub (global.get $bp) (i32.const 4))))
		(i32.store (i32.sub (global.get $bp) (i32.const 60)) (i32.load (i32.sub (global.get $bp) (i32.const 8))))
		(i32.store (i32.sub (global.get $bp) (i32.const 64)) (i32.const 0))
		(block $block_0 (loop $loop_0 (br_if $block_0 (i32.eqz (i32.and (i32.ne (i32.const 0) (i32.lt_s (i32.load (i32.sub (global.get $bp) (i32.const 56))) (i32.load (i32.sub (global.get $bp) (i32.const 8))))) (i32.ne (i32.const 0) (i32.lt_s (i32.load (i32.sub (global.get $bp) (i32.const 60))) (i32.load (i32.sub (global.get $bp) (i32.const 12)))))))) (if (i32.le_s (i32.load (i32.add (i32.const 0) (i32.mul (i32.load (i32.sub (global.get $bp) (i32.const 56))) (i32.const 4)))) (i32.load (i32.add (i32.const 0) (i32.mul (i32.load (i32.sub (global.get $bp) (i32.const 60))) (i32.const 4))))) (then (i32.store (i32.add (i32.sub (global.get $bp) (i32.const 52)) (i32.mul (i32.store (i32.load (i32.sub (global.get $bp) (i32.const 64))) (i32.sub (global.get $bp) (i32.const 64)) (i32.add (i32.load (i32.sub (global.get $bp) (i32.const 64))) (i32.const 1))) (i32.const 4))) (i32.load (i32.add (i32.const 0) (i32.mul (i32.store (i32.load (i32.sub (global.get $bp) (i32.const 56))) (i32.sub (global.get $bp) (i32.const 56)) (i32.add (i32.load (i32.sub (global.get $bp) (i32.const 56))) (i32.const 1))) (i32.const 4)))))) (else(i32.store (i32.add (i32.sub (global.get $bp) (i32.const 52)) (i32.mul (i32.store (i32.load (i32.sub (global.get $bp) (i32.const 64))) (i32.sub (global.get $bp) (i32.const 64)) (i32.add (i32.load (i32.sub (global.get $bp) (i32.const 64))) (i32.const 1))) (i32.const 4))) (i32.load (i32.add (i32.const 0) (i32.mul (i32.store (i32.load (i32.sub (global.get $bp) (i32.const 60))) (i32.sub (global.get $bp) (i32.const 60)) (i32.add (i32.load (i32.sub (global.get $bp) (i32.const 60))) (i32.const 1))) (i32.const 4))))))) (br $loop_0)))
		(block $block_1 (loop $loop_1 (br_if $block_1 (i32.eqz (i32.lt_s (i32.load (i32.sub (global.get $bp) (i32.const 56))) (i32.load (i32.sub (global.get $bp) (i32.const 8)))))) (i32.store (i32.add (i32.sub (global.get $bp) (i32.const 52)) (i32.mul (i32.store (i32.load (i32.sub (global.get $bp) (i32.const 64))) (i32.sub (global.get $bp) (i32.const 64)) (i32.add (i32.load (i32.sub (global.get $bp) (i32.const 64))) (i32.const 1))) (i32.const 4))) (i32.load (i32.add (i32.const 0) (i32.mul (i32.store (i32.load (i32.sub (global.get $bp) (i32.const 56))) (i32.sub (global.get $bp) (i32.const 56)) (i32.add (i32.load (i32.sub (global.get $bp) (i32.const 56))) (i32.const 1))) (i32.const 4))))) (br $loop_1)))
		(block $block_2 (loop $loop_2 (br_if $block_2 (i32.eqz (i32.lt_s (i32.load (i32.sub (global.get $bp) (i32.const 60))) (i32.load (i32.sub (global.get $bp) (i32.const 12)))))) (i32.store (i32.add (i32.sub (global.get $bp) (i32.const 52)) (i32.mul (i32.store (i32.load (i32.sub (global.get $bp) (i32.const 64))) (i32.sub (global.get $bp) (i32.const 64)) (i32.add (i32.load (i32.sub (global.get $bp) (i32.const 64))) (i32.const 1))) (i32.const 4))) (i32.load (i32.add (i32.const 0) (i32.mul (i32.store (i32.load (i32.sub (global.get $bp) (i32.const 60))) (i32.sub (global.get $bp) (i32.const 60)) (i32.add (i32.load (i32.sub (global.get $bp) (i32.const 60))) (i32.const 1))) (i32.const 4))))) (br $loop_2)))
		(i32.store (i32.sub (global.get $bp) (i32.const 68)) (i32.load (i32.sub (global.get $bp) (i32.const 4))))
		(block $block_3 (loop $loop_3 (br_if $block_3 (i32.eqz (i32.lt_s (i32.load (i32.sub (global.get $bp) (i32.const 68))) (i32.load (i32.sub (global.get $bp) (i32.const 12)))))) (i32.store (i32.add (i32.const 0) (i32.mul (i32.load (i32.sub (global.get $bp) (i32.const 68))) (i32.const 4))) (i32.load (i32.add (i32.sub (global.get $bp) (i32.const 52)) (i32.mul (i32.sub (i32.load (i32.sub (global.get $bp) (i32.const 68))) (i32.load (i32.sub (global.get $bp) (i32.const 4)))) (i32.const 4))))) (i32.store (i32.sub (global.get $bp) (i32.const 68)) (i32.add (i32.load (i32.sub (global.get $bp) (i32.const 68))) (i32.const 1))) (br $loop_3)))
	)
	(func $mergesort
		(if (i32.le_s (i32.sub (i32.load (i32.sub (global.get $bp) (i32.const 8))) (i32.load (i32.sub (global.get $bp) (i32.const 4)))) (i32.const 1)) (then (return)))
		(i32.store (i32.sub (global.get $bp) (i32.const 12)) (i32.div_s (i32.add (i32.load (i32.sub (global.get $bp) (i32.const 8))) (i32.load (i32.sub (global.get $bp) (i32.const 4)))) (i32.const 2)))
		(call $mergesort (if (i32.le_s (i32.sub (global.get $sp) (i32.const 16)) (global.get $hp)) (then (global.set $r1 (i32.mul (memory.size) (i32.const 65536))) (global.set $r2 (i32.sub (global.get $r1) (i32.const 1))) (global.set $r1 (i32.sub (global.get $r1) (global.get $sp))) (drop (memory.grow (i32.const 1))) (global.set $sp (i32.sub (i32.mul (memory.size) (i32.const 65536)) (global.get $r1))) (global.set $r1 (i32.sub (i32.mul (memory.size) (i32.const 65536)) (i32.const 1))) (block $memcopy_block (loop $memcopy_loop (br_if $memcopy_block (i32.ne (i32.const 0) (i32.lt_s (global.get $r1) (global.get $sp)))) (i32.store (global.get $r1) (i32.load (global.get $r2))) (global.set $r1 (i32.sub (global.get $r1) (i32.const 1))) (global.set $r2 (i32.sub (global.get $r2) (i32.const 1))) (br $memcopy_loop))))) (global.set $sp (i32.sub (global.get $sp) (i32.const 4))) (i32.store (global.get $sp) (global.get $bp)) (global.set $r1 (global.get $sp)) (global.set $sp (i32.sub (global.get $sp) (i32.const 12))) (i32.store (i32.sub (global.get $r1) (i32.const 4)) (i32.load (i32.sub (global.get $bp) (i32.const 4)))) (i32.store (i32.sub (global.get $r1) (i32.const 8)) (i32.load (i32.sub (global.get $bp) (i32.const 12)))) (global.set $bp (global.get $r1))) (global.set $sp (i32.add (global.get $bp) (i32.const 4))) (global.set $bp (i32.load (global.get $bp)))
		(call $mergesort (if (i32.le_s (i32.sub (global.get $sp) (i32.const 16)) (global.get $hp)) (then (global.set $r1 (i32.mul (memory.size) (i32.const 65536))) (global.set $r2 (i32.sub (global.get $r1) (i32.const 1))) (global.set $r1 (i32.sub (global.get $r1) (global.get $sp))) (drop (memory.grow (i32.const 1))) (global.set $sp (i32.sub (i32.mul (memory.size) (i32.const 65536)) (global.get $r1))) (global.set $r1 (i32.sub (i32.mul (memory.size) (i32.const 65536)) (i32.const 1))) (block $memcopy_block (loop $memcopy_loop (br_if $memcopy_block (i32.ne (i32.const 0) (i32.lt_s (global.get $r1) (global.get $sp)))) (i32.store (global.get $r1) (i32.load (global.get $r2))) (global.set $r1 (i32.sub (global.get $r1) (i32.const 1))) (global.set $r2 (i32.sub (global.get $r2) (i32.const 1))) (br $memcopy_loop))))) (global.set $sp (i32.sub (global.get $sp) (i32.const 4))) (i32.store (global.get $sp) (global.get $bp)) (global.set $r1 (global.get $sp)) (global.set $sp (i32.sub (global.get $sp) (i32.const 12))) (i32.store (i32.sub (global.get $r1) (i32.const 4)) (i32.load (i32.sub (global.get $bp) (i32.const 12)))) (i32.store (i32.sub (global.get $r1) (i32.const 8)) (i32.load (i32.sub (global.get $bp) (i32.const 8)))) (global.set $bp (global.get $r1))) (global.set $sp (i32.add (global.get $bp) (i32.const 4))) (global.set $bp (i32.load (global.get $bp)))
		(call $merge (if (i32.le_s (i32.sub (global.get $sp) (i32.const 72)) (global.get $hp)) (then (global.set $r1 (i32.mul (memory.size) (i32.const 65536))) (global.set $r2 (i32.sub (global.get $r1) (i32.const 1))) (global.set $r1 (i32.sub (global.get $r1) (global.get $sp))) (drop (memory.grow (i32.const 1))) (global.set $sp (i32.sub (i32.mul (memory.size) (i32.const 65536)) (global.get $r1))) (global.set $r1 (i32.sub (i32.mul (memory.size) (i32.const 65536)) (i32.const 1))) (block $memcopy_block (loop $memcopy_loop (br_if $memcopy_block (i32.ne (i32.const 0) (i32.lt_s (global.get $r1) (global.get $sp)))) (i32.store (global.get $r1) (i32.load (global.get $r2))) (global.set $r1 (i32.sub (global.get $r1) (i32.const 1))) (global.set $r2 (i32.sub (global.get $r2) (i32.const 1))) (br $memcopy_loop))))) (global.set $sp (i32.sub (global.get $sp) (i32.const 4))) (i32.store (global.get $sp) (global.get $bp)) (global.set $r1 (global.get $sp)) (global.set $sp (i32.sub (global.get $sp) (i32.const 68))) (i32.store (i32.sub (global.get $r1) (i32.const 4)) (i32.load (i32.sub (global.get $bp) (i32.const 4)))) (i32.store (i32.sub (global.get $r1) (i32.const 8)) (i32.load (i32.sub (global.get $bp) (i32.const 12)))) (i32.store (i32.sub (global.get $r1) (i32.const 12)) (i32.load (i32.sub (global.get $bp) (i32.const 8)))) (global.set $bp (global.get $r1))) (global.set $sp (i32.add (global.get $bp) (i32.const 4))) (global.set $bp (i32.load (global.get $bp)))
	)
	(func $main
		(call $mergesort (if (i32.le_s (i32.sub (global.get $sp) (i32.const 16)) (global.get $hp)) (then (global.set $r1 (i32.mul (memory.size) (i32.const 65536))) (global.set $r2 (i32.sub (global.get $r1) (i32.const 1))) (global.set $r1 (i32.sub (global.get $r1) (global.get $sp))) (drop (memory.grow (i32.const 1))) (global.set $sp (i32.sub (i32.mul (memory.size) (i32.const 65536)) (global.get $r1))) (global.set $r1 (i32.sub (i32.mul (memory.size) (i32.const 65536)) (i32.const 1))) (block $memcopy_block (loop $memcopy_loop (br_if $memcopy_block (i32.ne (i32.const 0) (i32.lt_s (global.get $r1) (global.get $sp)))) (i32.store (global.get $r1) (i32.load (global.get $r2))) (global.set $r1 (i32.sub (global.get $r1) (i32.const 1))) (global.set $r2 (i32.sub (global.get $r2) (i32.const 1))) (br $memcopy_loop))))) (global.set $sp (i32.sub (global.get $sp) (i32.const 4))) (i32.store (global.get $sp) (global.get $bp)) (global.set $r1 (global.get $sp)) (global.set $sp (i32.sub (global.get $sp) (i32.const 12))) (i32.store (i32.sub (global.get $r1) (i32.const 4)) (i32.const 0)) (i32.store (i32.sub (global.get $r1) (i32.const 8)) (i32.const 10)) (global.set $bp (global.get $r1))) (global.set $sp (i32.add (global.get $bp) (i32.const 4))) (global.set $bp (i32.load (global.get $bp)))
		(i32.store (i32.sub (global.get $bp) (i32.const 4)) (i32.const 0))
		(block $block_0 (loop $loop_0 (br_if $block_0 (i32.eqz (i32.lt_s (i32.load (i32.sub (global.get $bp) (i32.const 4))) (i32.const 10)))) (call $print_int (if (i32.le_s (i32.sub (global.get $sp) (i32.const 8)) (global.get $hp)) (then (global.set $r1 (i32.mul (memory.size) (i32.const 65536))) (global.set $r2 (i32.sub (global.get $r1) (i32.const 1))) (global.set $r1 (i32.sub (global.get $r1) (global.get $sp))) (drop (memory.grow (i32.const 1))) (global.set $sp (i32.sub (i32.mul (memory.size) (i32.const 65536)) (global.get $r1))) (global.set $r1 (i32.sub (i32.mul (memory.size) (i32.const 65536)) (i32.const 1))) (block $memcopy_block (loop $memcopy_loop (br_if $memcopy_block (i32.ne (i32.const 0) (i32.lt_s (global.get $r1) (global.get $sp)))) (i32.store (global.get $r1) (i32.load (global.get $r2))) (global.set $r1 (i32.sub (global.get $r1) (i32.const 1))) (global.set $r2 (i32.sub (global.get $r2) (i32.const 1))) (br $memcopy_loop))))) (global.set $sp (i32.sub (global.get $sp) (i32.const 4))) (i32.store (global.get $sp) (global.get $bp)) (global.set $r1 (global.get $sp)) (global.set $sp (i32.sub (global.get $sp) (i32.const 4))) (i32.store (i32.sub (global.get $r1) (i32.const 4)) (i32.load (i32.add (i32.const 0) (i32.mul (i32.load (i32.sub (global.get $bp) (i32.const 4))) (i32.const 4))))) (global.set $bp (global.get $r1))) (global.set $sp (i32.add (global.get $bp) (i32.const 4))) (global.set $bp (i32.load (global.get $bp))) (i32.store (i32.sub (global.get $bp) (i32.const 4)) (i32.add (i32.load (i32.sub (global.get $bp) (i32.const 4))) (i32.const 1))) (br $loop_0)))
	)
	(func $print_int
		(call $print_int_o (i32.sub (global.get $bp) (i32.const 4)))
	)
	(start $main)
)
