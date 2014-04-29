#include "mbed.h"
#include "MPU6050.h"
#include "HMC5883L.h"
 
DigitalOut led(LED1);

Serial pc(SERIAL_TX, SERIAL_RX);
 
int main()
{
    pc.baud(115200);

    pc.printf("Setting up\n"); 
    // x axis points right, y forward, and z out
    MPU6050 imu(I2C_SDA, I2C_SCL);
    pc.printf("Done\n");
    if(!imu.testConnection()) {
        pc.printf("Bad connection\n");
        char temp;
        temp = imu.read(MPU6050_WHO_AM_I_REG);
        bool ok = (temp == (MPU6050_ADDRESS & 0xFE));

        pc.printf("%x", temp);
        
        while(true) {
            led = !led;
            wait(0.25);
        } 
    }

    while(true) {
        float rotation[3];
        imu.getGyro(rotation);
        pc.printf("{\"a\":[%f,%f,%f],", rotation[0], rotation[1], rotation[2]);

        float acc[3];
        imu.getAccelero(acc);
        pc.printf("\"b\":[%f,%f,%f]}\n", acc[0], acc[1], acc[2]);
        
        wait(0.05);
        led = !led;
    } 
    
}
