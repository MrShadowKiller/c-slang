#include <source_stdlib>

int main() {
  int x = 2;
  int y = 2;
  int z = x <= y != 3 > 2 == 10;
  z = 1 > 2 || 2 < 10;
  z = 1 != 1 && 10;
  print_int(x);
  print_int(y);
  print_int(z);
}